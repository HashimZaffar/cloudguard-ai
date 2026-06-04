# Monitoring Guide

This document explains how monitoring is being added to CloudGuard AI.

## Current Local Monitoring Stack

The auth-service already exposes application metrics at:

```text
http://localhost:5001/metrics
```

The Docker Compose stack now adds:

- Prometheus for collecting metrics
- Grafana for visualizing metrics in dashboards

## How It Works

Prometheus scrapes the auth-service every 15 seconds.

Scraping means Prometheus calls the `/metrics` endpoint, reads the metrics text, and stores the values over time.

Inside Docker Compose, Prometheus reaches auth-service by using the Docker service name:

```text
auth-service:5001
```

This works because both containers are attached to the same Docker network.

## Local URLs

- Auth Service: http://localhost:5001
- Auth Health Check: http://localhost:5001/health
- Auth Metrics: http://localhost:5001/metrics
- Prometheus: http://localhost:9090
- Prometheus Targets: http://localhost:9090/targets
- Grafana: http://localhost:3000

Grafana login for local learning:

```text
Username: admin
Password: admin
```

Do not use `admin/admin` in production.

## Commands

Start the stack from the project root:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

Check containers:

```bash
docker ps
```

Stop the stack:

```bash
docker compose -f docker/docker-compose.auth.yml down
```

## Planned Later

- More Grafana dashboards
- Loki for logs
- Alertmanager for alerts
- Kubernetes monitoring manifests
