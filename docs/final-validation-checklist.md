# Final Validation Checklist

Use this checklist before pushing CloudGuard AI to GitHub.

## Auth Service Checks

Run from `apps/auth-service`:

```bash
npm install
npm run format:check
npm run lint
npm test
npm run security:audit
```

Expected result:

- dependencies install successfully
- formatting check passes
- ESLint passes
- Jest tests pass
- npm audit reports no moderate, high, or critical vulnerabilities

## Docker Compose Checks

Run from the project root:

```bash
docker compose -f docker/docker-compose.auth.yml config
docker compose -f docker/docker-compose.deploy.yml config
```

Expected result:

- both Compose files render without YAML errors
- `docker/docker-compose.auth.yml` includes auth-service, PostgreSQL, Prometheus, Grafana, Loki, Promtail, and Alertmanager
- `docker/docker-compose.deploy.yml` renders correctly, but needs a real `AUTH_SERVICE_IMAGE` before deployment

## Script Syntax Checks

Run from the project root:

```bash
bash -n scripts/deploy-auth-service.sh
bash -n scripts/rollback-auth-service.sh
```

Expected result:

- no syntax errors

## Docker Build Check

Run from the project root:

```bash
docker build -t cloudguard-auth-service:final ./apps/auth-service
```

Expected result:

- Docker image builds successfully

## Start Full Local Stack

Run from the project root:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
docker ps
```

Expected result:

- PostgreSQL is running and healthy
- auth-service is running and healthy
- Prometheus is running
- Grafana is running
- Loki is running
- Promtail is running
- Alertmanager is running

## API Checks

Run from the project root:

```bash
curl http://localhost:5001/health
curl http://localhost:5001/ready
curl http://localhost:5001/health/db
curl http://localhost:5001/metrics
```

Expected result:

- `/health` returns healthy JSON
- `/ready` returns ready JSON when PostgreSQL is connected
- `/health/db` returns database connected JSON
- `/metrics` returns Prometheus text format

## Monitoring Checks

Run from the project root:

```bash
curl http://localhost:9090/-/ready
curl http://localhost:3100/ready
curl http://localhost:9093/-/ready
```

Expected result:

- Prometheus is ready
- Loki is ready
- Alertmanager is ready

## Sample Traffic

Run from the project root:

```bash
curl http://localhost:5001/
curl http://localhost:5001/health
curl http://localhost:5001/unknown-route
```

Expected result:

- normal endpoints return success
- unknown route returns a safe 404 response
- request logs and metrics are generated

## Browser Checks

Open these URLs:

```text
Auth API Docs:
http://localhost:5001/api-docs

Prometheus:
http://localhost:9090

Prometheus targets:
http://localhost:9090/targets

Prometheus alerts:
http://localhost:9090/alerts

Grafana:
http://localhost:3000

Alertmanager:
http://localhost:9093
```

Grafana login:

```text
admin / admin
```

Expected result:

- Swagger UI loads
- Prometheus target `cloudguard-auth-service` is `UP`
- Grafana shows the CloudGuard AI dashboards
- Grafana Explore can query Loki logs
- Alertmanager UI loads

## DevSecOps Checks

Run from the project root:

```bash
./security/run-local-security-scans.sh
```

Expected result:

- npm audit runs
- Gitleaks runs
- Semgrep runs
- Docker image builds
- Trivy scans the image

Note:
Semgrep may report a CSRF warning for Express. Review it in context because this API uses JWT Bearer tokens instead of cookie-based browser sessions.

## Stop Stack

Run from the project root:

```bash
docker compose -f docker/docker-compose.auth.yml down
```

Expected result:

- all local stack containers stop cleanly

## Git Safety Checks

Run from the project root:

```bash
git status
git diff
git diff --cached
```

Expected result:

- `.env` is not staged
- `node_modules` is not staged
- no real secrets are staged
- docs and configuration changes are intentional

## Checks That Need GitHub Or Manual Review

- GitHub Actions fully validate after pushing to GitHub.
- GHCR publishing fully validates after running the publish workflow.
- Deployment workflow needs a configured self-hosted runner.
- Grafana dashboard visibility should be checked in the browser.
- Alertmanager UI should be checked in the browser.
