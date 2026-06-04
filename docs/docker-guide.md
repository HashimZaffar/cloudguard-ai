# Docker Guide

This guide explains the Docker pieces used in CloudGuard AI.

## What Docker Is

Docker is a tool for packaging and running applications in containers. A container includes the application, runtime, and dependencies needed to run the service.

## What A Dockerfile Is

A `Dockerfile` is a set of instructions for building a Docker image. For `auth-service`, it tells Docker which Node.js image to use, how to install dependencies, which port to expose, and how to start the service.

## What A Docker Image Is

A Docker image is a packaged blueprint of the application. It is not running by itself. It contains the app code, production dependencies, and startup command.

## What A Docker Container Is

A Docker container is a running instance of an image. You can start, stop, remove, and recreate containers without changing the original image.

## What Docker Compose Is

Docker Compose lets you define services in a YAML file and run them with one command. This is easier than typing a long `docker run` command every time.

## What docker-compose.auth.yml Does

The file `docker/docker-compose.auth.yml` currently runs:

- `auth-service`
- PostgreSQL
- Prometheus
- Alertmanager
- Grafana
- Loki
- Promtail

It defines:

- the build path for `apps/auth-service`
- the image name `cloudguard-auth-service:1.0.0`
- the container name `cloudguard-auth-service`
- port mapping from `5001` on your machine to `5001` in the container
- environment variables from `apps/auth-service/.env`
- a health check for `/health`
- a PostgreSQL database container named `cloudguard-auth-postgres`
- port mapping from `5432` on your machine to `5432` in the database container
- an Alertmanager container named `cloudguard-alertmanager`
- port mapping from `9093` on your machine to `9093` in the Alertmanager container
- a Docker network named `cloudguard-network`
- a named volume called `cloudguard-auth-postgres-data`
- a named volume called `cloudguard-grafana-data`
- a named volume called `cloudguard-loki-data`

Redis and other services will be added in later phases.

## What A Docker Volume Is

A Docker volume stores data outside the container filesystem. This matters for databases.

The volume `cloudguard-auth-postgres-data` keeps PostgreSQL data even if containers stop or are recreated. Without a volume, database data could disappear when the container is removed.

## Common Commands

Create the local env file if it is missing:

```bash
cp apps/auth-service/.env.example apps/auth-service/.env
```

Validate the Compose file:

```bash
docker compose -f docker/docker-compose.auth.yml config
```

Start the service:

```bash
docker compose -f docker/docker-compose.auth.yml up --build
```

Start the service in the background:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

Check running containers:

```bash
docker ps
```

Test the service:

```bash
curl http://localhost:5001/health
```

View logs:

```bash
docker compose -f docker/docker-compose.auth.yml logs -f auth-service
```

Stop the service:

```bash
docker compose -f docker/docker-compose.auth.yml down
```

## Migrations And Seeding With Docker Compose

PostgreSQL must be running before Prisma migrations or seed scripts can connect to the database.

Start only PostgreSQL:

```bash
docker compose -f docker/docker-compose.auth.yml up -d postgres
```

Then run database setup from `apps/auth-service`:

```bash
npm run db:setup
```

This command generates the Prisma client, runs migrations, and creates demo users.

The Docker volume `cloudguard-auth-postgres-data` keeps database data even after containers stop. This is useful because your local data survives restarts.

Old data may remain if the volume already exists. To delete local PostgreSQL data, you can remove the volume:

```bash
docker compose -f docker/docker-compose.auth.yml down -v
```

Warning:
This deletes local PostgreSQL data.

## Health Checks

Docker uses the auth-service `/health` endpoint for its container healthcheck. This endpoint only checks that the Node.js process is alive.

PostgreSQL has its own healthcheck using `pg_isready`.

The `/ready` endpoint is more useful later for Kubernetes because it checks whether the app can reach PostgreSQL. If the database is not available, `/ready` may return `503`.

The `/health/db` endpoint is a focused database connection check.

## Metrics Endpoint

The auth-service now exposes `/metrics`.

Prometheus scrapes this endpoint to collect service metrics:

```bash
curl http://localhost:5001/metrics
```

The response is Prometheus text format, not JSON.

Open Prometheus targets in your browser:

```text
http://localhost:9090/targets
```

Open Grafana in your browser:

```text
http://localhost:3000
```

Local Grafana login:

```text
Username: admin
Password: admin
```

Grafana provisioning automatically loads the Prometheus datasource and the auth-service dashboard.

If the dashboard is not visible, restart Grafana:

```bash
docker compose -f docker/docker-compose.auth.yml restart grafana
```

If panels show no data, generate traffic against auth-service and wait at least 30 seconds for Prometheus to scrape new metrics.

## Alerting Services in Docker Compose

Docker Compose now starts Alertmanager with the local monitoring stack.

Prometheus reads alert rules from:

```text
monitoring/prometheus/alert-rules.yml
```

When an alert starts firing, Prometheus sends it to Alertmanager at:

```text
http://alertmanager:9093
```

From your browser, open:

```text
http://localhost:9093
```

Local alerts are for learning only. No real email, Slack, or PagerDuty notification is configured yet.

Open the Prometheus alerts page:

```text
http://localhost:9090/alerts
```

## Logging Services in Docker Compose

Docker Compose now starts:

- auth-service
- PostgreSQL
- Prometheus
- Alertmanager
- Grafana
- Loki
- Promtail

Loki stores logs. Promtail collects logs from Docker containers and sends them to Loki. Grafana displays those logs through the Loki datasource.

This local setup uses the Docker socket so Promtail can discover local containers:

```text
/var/run/docker.sock
```

Some Linux examples mount Docker log files from:

```text
/var/lib/docker/containers
```

That path is not reliable on every machine. For example, Snap-based Docker installs may not expose it in the same way. The Docker socket approach is simpler for this beginner local setup.

Check Loki readiness:

```bash
curl http://localhost:3100/ready
```

View Promtail logs:

```bash
docker compose -f docker/docker-compose.auth.yml logs -f promtail
```

View Loki logs:

```bash
docker compose -f docker/docker-compose.auth.yml logs -f loki
```

If the Loki datasource is missing in Grafana, restart Grafana:

```bash
docker compose -f docker/docker-compose.auth.yml restart grafana
```

## Beginner Troubleshooting

Problem:
Port `5001` is already in use.

Solution:
Stop the old container or change the port mapping in the Compose file.

Problem:
`.env` file is missing.

Solution:
Run:

```bash
cp apps/auth-service/.env.example apps/auth-service/.env
```

Problem:
Container starts but API is not responding.

Solution:
Check logs:

```bash
docker compose -f docker/docker-compose.auth.yml logs -f auth-service
```

Problem:
PostgreSQL starts, but tests cannot find the test database.

Solution:
If the PostgreSQL volume already existed before the test database init script was added, create the test database manually or recreate the local volume when it is safe to lose local database data.
