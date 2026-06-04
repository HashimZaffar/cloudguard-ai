# Alerting Guide

This guide explains local alerting for CloudGuard AI.

## What Alerting Is

Alerting means automatically checking for problems and raising a warning when something needs attention.

Monitoring shows what is happening. Alerting tells engineers when they should look.

## Why Alerts Matter in DevOps

In DevOps work, engineers need to know quickly when a service is down, slow, unhealthy, or using too many resources.

Good alerts help teams respond before users report the problem.

## What Prometheus Alert Rules Are

Prometheus alert rules are PromQL queries that check metric data.

The alert rules for auth-service live here:

```text
monitoring/prometheus/alert-rules.yml
```

Prometheus loads this file and checks each rule regularly.

## What Alertmanager Is

Alertmanager receives alerts from Prometheus.

In this local setup, Alertmanager is used as a learning UI. It does not send real email, Slack, PagerDuty, or webhook notifications yet.

Open Alertmanager:

```text
http://localhost:9093
```

## Dashboard Monitoring vs Alerting

Dashboard monitoring is something you look at. Grafana dashboards show charts for request rate, latency, memory usage, and logs.

Alerting watches conditions for you. Prometheus checks alert rules and sends firing alerts to Alertmanager.

## Auth-Service Alerts

### AuthServiceDown

This alert fires when Prometheus cannot scrape auth-service metrics.

It usually means auth-service is stopped, unhealthy, or unreachable from the Docker network.

### HighHttpErrorRate

This alert fires when more than 5% of auth-service requests return 5xx errors.

5xx responses usually mean the server failed while handling a request.

### HighRequestLatencyP95

This alert fires when the 95th percentile request latency is above 1 second.

This means the slowest 5% of requests are taking too long.

### HighMemoryUsage

This alert fires when auth-service memory usage is above 300MB for 5 minutes.

High memory usage can point to inefficient code, too much traffic, or a memory leak.

### NoRecentSuccessfulLogin

This alert fires when no successful login has been recorded for 30 minutes.

This alert is for learning only. It may be noisy in local development because nobody may be logging in.

## Alert States

- `inactive`: the alert condition is not true.
- `pending`: the condition is true, but Prometheus is waiting for the `for` duration.
- `firing`: the condition stayed true long enough and was sent to Alertmanager.

## How To Test Alerting Locally

To test `AuthServiceDown`:

1. Start the stack:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

2. Stop auth-service only:

```bash
docker compose -f docker/docker-compose.auth.yml stop auth-service
```

3. Open Prometheus alerts:

```text
http://localhost:9090/alerts
```

4. Wait until `AuthServiceDown` becomes `pending` or `firing`.

5. Open Alertmanager:

```text
http://localhost:9093
```

6. Start auth-service again:

```bash
docker compose -f docker/docker-compose.auth.yml start auth-service
```

Alerts may take 1-2 minutes because Prometheus has a scrape interval and each alert has a `for` duration.

## Useful Local URLs

- Prometheus targets: http://localhost:9090/targets
- Prometheus alerts: http://localhost:9090/alerts
- Alertmanager: http://localhost:9093
- Grafana: http://localhost:3000
