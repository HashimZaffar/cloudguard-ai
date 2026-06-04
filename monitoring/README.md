# CloudGuard AI Monitoring

This folder contains the local monitoring setup for CloudGuard AI.

## What Prometheus Is

Prometheus is a monitoring tool that collects numeric data from applications. This data is called metrics.

For example, the auth-service exposes metrics such as:

- total HTTP requests
- request duration
- login attempts
- user registrations
- Node.js process memory usage

## What Grafana Is

Grafana is a dashboard tool. It reads metrics from Prometheus and turns them into charts, tables, and visual panels.

Prometheus collects the data. Grafana helps humans understand the data.

## What Scraping Means

Scraping means Prometheus regularly calls a metrics endpoint and stores the response.

In this project:

1. The auth-service exposes metrics at `/metrics`.
2. Prometheus calls `http://auth-service:5001/metrics` every 15 seconds.
3. Grafana connects to Prometheus and displays the collected metrics.

## Why Docker Networking Matters

Inside Docker Compose, containers can talk to each other by service name when they are on the same network.

That is why Prometheus uses:

```text
auth-service:5001
```

instead of:

```text
localhost:5001
```

From your browser, you still use `localhost` because your browser runs on your computer, not inside the Docker network.

## Local URLs

- Auth Service: http://localhost:5001
- Auth Health Check: http://localhost:5001/health
- Auth Metrics: http://localhost:5001/metrics
- Prometheus: http://localhost:9090
- Prometheus Targets: http://localhost:9090/targets
- Prometheus Alerts: http://localhost:9090/alerts
- Alertmanager: http://localhost:9093
- Loki Ready Check: http://localhost:3100/ready
- Grafana: http://localhost:3000

## Grafana Login

- Username: `admin`
- Password: `admin`

Warning:
`admin/admin` is only for local learning. In a real production system, always use a strong password stored securely.

## Start The Monitoring Stack

Run this from the project root:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

Open Prometheus targets:

```text
http://localhost:9090/targets
```

The `cloudguard-auth-service` target should show as `UP`.

Open Grafana:

```text
http://localhost:3000
```

Grafana is configured with Prometheus as the default datasource. A starter auth-service dashboard is also provisioned automatically.

## Grafana Dashboard

A dashboard is a visual page made of panels. Each panel shows one metric or one group of related metrics.

PromQL is the query language used by Prometheus. Grafana panels use PromQL to ask Prometheus for the exact metric data they should display.

Open Grafana:

```text
http://localhost:3000
```

Login:

```text
admin / admin
```

Dashboard folder:

```text
CloudGuard AI
```

Dashboard name:

```text
CloudGuard AI - Auth Service Dashboard
```

Auth-service dashboard panels:

- Service Status / Up: shows whether Prometheus can scrape auth-service.
- Total HTTP Requests: shows request rate across the service.
- HTTP Requests by Status Code: separates traffic by status code, such as `200`, `400`, or `500`.
- Average Request Duration: shows average response time.
- 95th Percentile Request Duration: shows slower request behavior for the slowest 5 percent.
- Login Attempts: shows login attempt rate by status.
- User Registrations: shows registration rate by status.
- Node.js Memory Usage: shows process memory usage.
- Process Uptime: shows how long the Node.js process has been running.

## Centralized Logging with Loki and Promtail

Logs are text records of what happened inside an application. They help engineers understand what happened before, during, and after an issue.

Loki is a log storage system from Grafana Labs. It stores logs and makes them searchable from Grafana.

Promtail is a log collector. In this project, Promtail discovers local Docker containers through the Docker socket and sends their logs to Loki.

Grafana connects to Loki as a datasource. This lets you view metrics and logs from the same Grafana UI.

Prometheus metrics and Loki logs solve different problems:

- Prometheus metrics answer numeric questions, such as request rate, latency, and memory usage.
- Loki logs answer event questions, such as which request happened, what error appeared, and what the service logged.

Logs are important for incident investigation and AIOps because they provide context around failures. Future AI tools can summarize log patterns and help explain incidents.

Open Loki readiness check:

```text
http://localhost:3100/ready
```

Open Grafana:

```text
http://localhost:3000
```

In Grafana:

1. Go to Explore.
2. Select the Loki datasource.
3. Run this LogQL query:

```logql
{job="docker-containers"}
```

The local Promtail setup uses `/var/run/docker.sock` instead of mounting `/var/lib/docker/containers`. This is easier for local learning because Docker log file paths can behave differently on Snap Docker, Docker Desktop, macOS, and Windows.

## Alerting with Prometheus and Alertmanager

Monitoring tells us what is happening. Alerting tells us when something needs attention.

Metrics are the numeric data collected by Prometheus. Dashboards are the charts Grafana shows from those metrics. Alerts are rules that watch metrics and create a warning when a condition stays bad for a period of time.

Prometheus alert rules are PromQL expressions saved in `monitoring/prometheus/alert-rules.yml`. Prometheus checks these rules on every evaluation cycle.

Alertmanager receives alerts from Prometheus. In this local learning setup, Alertmanager does not send real email, Slack, or PagerDuty notifications yet. Alerts are visible in the Alertmanager UI.

Open Prometheus alerts:

```text
http://localhost:9090/alerts
```

Open Alertmanager:

```text
http://localhost:9093
```

Alert states:

- `inactive`: the alert condition is not true.
- `pending`: the condition is true, but the alert is waiting for its `for` duration.
- `firing`: the condition has stayed true long enough, so Prometheus sends it to Alertmanager.

Auth-service alerts:

- `AuthServiceDown`: Prometheus cannot scrape auth-service metrics.
- `HighHttpErrorRate`: more than 5% of auth-service requests are returning 5xx errors.
- `HighRequestLatencyP95`: the 95th percentile request latency is above 1 second.
- `HighMemoryUsage`: auth-service memory usage is above 300MB.
- `NoRecentSuccessfulLogin`: no successful login was recorded in the last 30 minutes.

The `NoRecentSuccessfulLogin` alert is for learning only. It may be noisy in local development because there may be long periods where nobody logs in.

## Stop The Stack

Run this from the project root:

```bash
docker compose -f docker/docker-compose.auth.yml down
```
