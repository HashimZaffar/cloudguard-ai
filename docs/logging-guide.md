# Logging Guide

This guide explains local centralized logging for CloudGuard AI.

## Application Logs

Application logs are messages written by a service while it runs. They can show requests, errors, startup messages, database problems, and other useful events.

## Structured Logs

Structured logs use a predictable format, often JSON. They are easier for tools to search and filter than plain text logs.

The auth-service already writes useful request logs, including method, URL, status code, response time, and user agent.

## Centralized Logging

Centralized logging means logs from services are collected into one place. This makes debugging easier because engineers do not need to inspect each container manually.

In this project:

1. auth-service writes logs to Docker.
2. Promtail reads Docker container logs.
3. Promtail sends logs to Loki.
4. Grafana reads logs from Loki.

## What Loki Is

Loki is a log storage system from Grafana Labs. It is designed to work well with Grafana and uses labels to organize logs.

## What Promtail Is

Promtail is a log collector. It discovers containers, adds labels, and sends log lines to Loki.

In this local Docker setup, Promtail uses:

```text
/var/run/docker.sock
```

This is the Docker socket. It lets Promtail discover containers without depending on a specific Docker log file path.

## LogQL Basics

LogQL is Loki's query language.

Show all Docker container logs:

```logql
{job="docker-containers"}
```

Filter logs that contain a word:

```logql
{job="docker-containers"} |= "error"
```

Filter logs that do not contain a word:

```logql
{job="docker-containers"} != "health"
```

## Generate Auth-Service Logs

Start the local stack from the project root:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

Generate traffic:

```bash
curl http://localhost:5001/
curl http://localhost:5001/health
curl http://localhost:5001/unknown-route
```

## View Logs In Grafana Explore

Open Grafana:

```text
http://localhost:3000
```

Login:

```text
admin / admin
```

Then:

1. Go to Explore.
2. Select the Loki datasource.
3. Run:

```logql
{job="docker-containers"}
```

## Troubleshooting

Problem:
No logs appear in Grafana.

Possible checks:

- Is Promtail running?
- Is Loki ready?
- Is auth-service producing logs?
- Is the Docker socket mounted into Promtail?

Check Promtail logs:

```bash
docker compose -f docker/docker-compose.auth.yml logs -f promtail
```

Check Loki logs:

```bash
docker compose -f docker/docker-compose.auth.yml logs -f loki
```

Problem:
Loki datasource is missing.

Solution:
Restart Grafana:

```bash
docker compose -f docker/docker-compose.auth.yml restart grafana
```

Problem:
Promtail cannot read Docker logs.

Solution:
Check that `/var/run/docker.sock` is mounted in `docker/docker-compose.auth.yml` and that Promtail is running.
