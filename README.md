# CloudGuard AI

CloudGuard AI is a DevOps, DevSecOps, and AIOps portfolio project built step by step from scratch.

The current phase focuses on one production-style backend service: `auth-service`. It shows how a real service can be built, tested, containerized, monitored, logged, scanned, documented, and prepared for safe deployment.

## Problem This Project Solves

Modern cloud platforms need more than application code. A useful service also needs:

- reliable API behavior
- secure authentication
- persistent database storage
- tests and code quality checks
- Docker packaging
- monitoring, logs, and alerts
- security scanning
- CI/CD automation
- safe deployment and rollback planning

CloudGuard AI demonstrates these practices in a beginner-friendly but professional structure.

## Tech Stack

- Backend: Node.js, Express.js
- Authentication: JWT, bcryptjs
- Database: PostgreSQL
- ORM: Prisma
- API Docs: Swagger/OpenAPI
- Testing: Jest, Supertest
- Code Quality: ESLint, Prettier
- Containers: Docker, Docker Compose
- Metrics: prom-client, Prometheus
- Dashboards: Grafana
- Logs: Winston, Loki, Promtail
- Alerts: Prometheus alert rules, Alertmanager
- Security: npm audit, Gitleaks, Semgrep, Trivy
- CI/CD: GitHub Actions
- Registry: GitHub Container Registry

## Architecture Summary

```text
Developer
   |
   v
auth-service API
   |
   +--> PostgreSQL
   |
   +--> /metrics --> Prometheus --> Grafana
   |
   +--> Docker logs --> Promtail --> Loki --> Grafana
   |
   +--> Prometheus alert rules --> Alertmanager
```

The current platform runs locally with Docker Compose. Kubernetes, Terraform, Argo CD, cloud deployment, SBOM generation, Cosign signing, and the AIOps assistant are future enhancements.

## Features Completed

- Express auth API with `/register`, `/login`, and protected `/profile`
- JWT authentication with safe token payloads
- Password hashing with bcryptjs
- PostgreSQL persistence with Prisma
- Prisma migration and seed script
- Health, readiness, and database health endpoints
- Swagger UI at `/api-docs`
- Structured request logging with Winston
- Prometheus metrics at `/metrics`
- Prometheus, Grafana, Loki, Promtail, and Alertmanager local stack
- Grafana dashboards for metrics and logs
- Alert rules for auth-service health and performance signals
- Jest and Supertest API tests
- ESLint and Prettier
- Dockerfile and Docker Compose
- Local DevSecOps scanning script
- GitHub Actions CI workflow
- GitHub Actions security workflow
- Docker publish workflow for GHCR
- Manual Docker Compose deployment and rollback planning

## Local Setup

Install dependencies:

```bash
cd apps/auth-service
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Run local checks:

```bash
npm run format:check
npm run lint
npm test
npm run security:audit
```

Tests need PostgreSQL. Start it from the project root if needed:

```bash
docker compose -f docker/docker-compose.auth.yml up -d postgres
```

## Docker Compose

Start the full local stack from the project root:

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

## API Links

- Auth health: http://localhost:5001/health
- Readiness: http://localhost:5001/ready
- Database health: http://localhost:5001/health/db
- Metrics: http://localhost:5001/metrics
- Swagger API docs: http://localhost:5001/api-docs

## Monitoring Links

- Prometheus: http://localhost:9090
- Prometheus targets: http://localhost:9090/targets
- Prometheus alerts: http://localhost:9090/alerts
- Grafana: http://localhost:3000
- Alertmanager: http://localhost:9093
- Loki readiness: http://localhost:3100/ready

Grafana local login:

```text
Username: admin
Password: admin
```

This login is only for local learning. Do not use `admin/admin` in production.

## Logging

The auth-service writes structured request logs with Winston.

Promtail reads Docker container logs and sends them to Loki. Grafana uses the Loki datasource to search and view logs.

Example Grafana Explore query:

```text
{container="cloudguard-auth-service"}
```

## Alerting

Prometheus loads alert rules from:

```text
monitoring/prometheus/alert-rules.yml
```

Alertmanager config is stored at:

```text
monitoring/alertmanager/alertmanager.yml
```

Local alerts are visible in the Alertmanager UI. Email, Slack, PagerDuty, or webhook receivers are future improvements.

## DevSecOps Scanning

Run the local security scan helper from the project root:

```bash
./security/run-local-security-scans.sh
```

This runs:

- npm audit for dependency vulnerabilities
- Gitleaks for secret scanning
- Semgrep for source code scanning
- Trivy for Docker image scanning

Semgrep may report a CSRF warning for Express. Because this API uses JWT Bearer tokens instead of cookie-based browser sessions, review that finding in context before deciding whether to add CSRF middleware.

## GitHub Actions

Workflows:

- `.github/workflows/auth-service-ci.yml`: format, lint, test, audit, Docker build, Trivy scan
- `.github/workflows/auth-service-security.yml`: Gitleaks, Semgrep, npm audit, Trivy
- `.github/workflows/auth-service-docker-publish.yml`: publish Docker image to GHCR
- `.github/workflows/auth-service-deploy-compose.yml`: manual Docker Compose deployment using a self-hosted runner

GitHub Actions runs are fully verified after pushing to GitHub.

## Docker Image Publishing

The publish workflow pushes the auth-service image to:

```text
ghcr.io/<github-owner>/cloudguard-auth-service
```

Supported tags include:

- `latest`
- `sha-<commit-sha>`
- semantic versions such as `1.0.0`
- minor versions such as `1.0`

## Deployment And Rollback

Deployment Compose file:

```text
docker/docker-compose.deploy.yml
```

Deploy script:

```bash
AUTH_SERVICE_IMAGE=ghcr.io/<github-owner>/cloudguard-auth-service:latest ./scripts/deploy-auth-service.sh
```

Rollback script:

```bash
PREVIOUS_AUTH_SERVICE_IMAGE=ghcr.io/<github-owner>/cloudguard-auth-service:sha-abc123 ./scripts/rollback-auth-service.sh
```

Deployment requires a real published GHCR image and, for the GitHub Actions deploy workflow, a configured self-hosted runner.

## Final Project Status

Current phase status: finalized and ready for GitHub preparation.

Completed in this phase:

- one working backend microservice
- database integration
- containerization
- local observability stack
- local and CI security checks
- CI/CD planning and workflows
- deployment and rollback foundation
- professional documentation

Future enhancements:

- Kubernetes manifests
- Helm chart
- GitOps with Argo CD
- Terraform infrastructure
- SBOM generation
- Cosign image signing
- AIOps incident assistant
- more microservices
- cloud deployment

## Portfolio Summary

CloudGuard AI demonstrates practical DevOps engineering across application development, testing, Docker, PostgreSQL, CI/CD, DevSecOps scanning, observability, alerting, and deployment planning.
