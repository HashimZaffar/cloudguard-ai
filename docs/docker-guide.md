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

It defines:

- the build path for `apps/auth-service`
- the image name `cloudguard-auth-service:1.0.0`
- the container name `cloudguard-auth-service`
- port mapping from `5001` on your machine to `5001` in the container
- environment variables from `apps/auth-service/.env`
- a health check for `/health`
- a PostgreSQL database container named `cloudguard-auth-postgres`
- port mapping from `5432` on your machine to `5432` in the database container
- a Docker network named `cloudguard-network`
- a named volume called `cloudguard-auth-postgres-data`

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
