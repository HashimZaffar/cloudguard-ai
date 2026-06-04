# CloudGuard AI

CloudGuard AI is a real-world DevOps, DevSecOps, and AIOps portfolio project.

The goal is to build a cloud-native microservices platform step by step. It will start simple, then grow into a production-style system with containers, Kubernetes, CI/CD, security scanning, monitoring, logging, and an AI-powered incident assistant.

## Project Goals

- Build a frontend dashboard for platform visibility.
- Create backend microservices for authentication, users, orders, and notifications.
- Use PostgreSQL for persistent data storage.
- Use Redis for caching and fast background workflows.
- Containerize services with Docker.
- Deploy services with Kubernetes.
- Automate testing, building, and deployment with GitHub Actions.
- Add DevSecOps scanning for code, containers, secrets, and Kubernetes manifests.
- Add monitoring, logging, and alerting.
- Build an AIOps assistant to help summarize incidents and suggest runbooks.

## Planned Tech Stack

- Frontend: React or Next.js
- Backend: Node.js or Python services
- Database: PostgreSQL
- Cache and queues: Redis
- Containers: Docker
- Orchestration: Kubernetes
- Infrastructure as Code: Terraform
- GitOps: Argo CD
- CI/CD: GitHub Actions
- Security: Trivy, Gitleaks, Semgrep, Kubescape, policy checks
- Monitoring: Prometheus, Grafana, Loki, Alertmanager
- AIOps: Python-based incident assistant and log summarizer

## Learning Roadmap

1. Phase 1: Project initialization and documentation
2. Phase 2: Build basic frontend and backend services
3. Phase 3: Add PostgreSQL and Redis locally
4. Phase 4: Add Dockerfiles and Docker Compose
5. Phase 5: Add Kubernetes manifests
6. Phase 6: Add GitHub Actions CI/CD
7. Phase 7: Add security scanning tools
8. Phase 8: Add monitoring and logging
9. Phase 9: Add AIOps incident assistant
10. Phase 10: Polish documentation and prepare portfolio demo

## Current Status

Phase 1 project initialization.

The base folder structure and starter documentation are now in place. Application code will be added in later phases.

## Run auth-service with Docker Compose

Docker Compose lets you run one or more containers from a single YAML file. It is useful for local development because you can start services with one command instead of typing long `docker run` commands.

Plain `docker run` starts one container from command-line options. Docker Compose stores those options in a reusable file, which becomes much easier once PostgreSQL, Redis, and other services are added.

This Compose setup currently runs `auth-service` and PostgreSQL. Redis will be added later.

Create the auth-service `.env` file if it is missing:

```bash
cp apps/auth-service/.env.example apps/auth-service/.env
```

Start auth-service:

```bash
docker compose -f docker/docker-compose.auth.yml up --build
```

Run in detached mode:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

Check running containers:

```bash
docker ps
```

Test the health endpoint:

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

## Local Monitoring with Prometheus, Grafana, Loki, Promtail, and Alertmanager

The auth-service exposes Prometheus metrics at `/metrics`. The local Docker Compose stack includes Prometheus to collect metrics and Grafana to visualize them.

Loki and Promtail are also included. Promtail collects Docker container logs, sends them to Loki, and Grafana lets you explore those logs using the Loki datasource.

Alertmanager is included for local alerting. Prometheus loads auth-service alert rules and sends firing alerts to Alertmanager.

Start the full local stack:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

Check containers:

```bash
docker ps
```

Open Auth Service:

```text
http://localhost:5001/health
```

Open Prometheus:

```text
http://localhost:9090
```

Check Prometheus targets:

```text
http://localhost:9090/targets
```

Check Prometheus alert rules:

```text
http://localhost:9090/alerts
```

Open Alertmanager:

```text
http://localhost:9093
```

Open Grafana:

```text
http://localhost:3000
```

Open Loki readiness check:

```text
http://localhost:3100/ready
```

Grafana local login:

```text
Username: admin
Password: admin
```

Grafana dashboard is automatically provisioned. Go to:

```text
Dashboards > CloudGuard AI > CloudGuard AI - Auth Service Dashboard
```

Logs can be explored in Grafana:

```text
Explore > Loki > {job="docker-containers"}
```

## Local DevSecOps Scanning

DevSecOps means adding security checks early in the development workflow. These local scans help find dependency vulnerabilities, leaked secrets, insecure code patterns, and Docker image vulnerabilities before CI/CD is added.

Run npm dependency audit from `apps/auth-service`:

```bash
npm run security:audit
```

Run Gitleaks secret scanning from the project root:

```bash
docker run --rm -v "${PWD}:/repo" zricethezav/gitleaks:latest detect --source="/repo" --config="/repo/security/gitleaks/gitleaks.toml" --verbose
```

Run Semgrep source scanning from the project root:

```bash
docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config auto /src/apps/auth-service
```

Build and scan the auth-service Docker image with Trivy:

```bash
cd apps/auth-service
docker build -t cloudguard-auth-service:1.0.0 .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image cloudguard-auth-service:1.0.0
```

You can also run the local helper script from the project root:

```bash
bash security/run-local-security-scans.sh
```

Full guide:

```text
docs/devsecops-guide.md
```

## GitHub Actions CI

CI means Continuous Integration. It automatically checks code changes before they are merged, which helps catch problems early.

The auth-service CI workflow lives here:

```text
.github/workflows/auth-service-ci.yml
```

It runs on pushes and pull requests to `main` and `develop`. It can also be started manually from GitHub Actions.

The workflow checks:

- dependency installation with `npm ci`
- Prisma client generation and database migrations
- formatting with `npm run format:check`
- linting with `npm run lint`
- tests with `npm test`
- dependency security audit with `npm run security:audit`
- Docker image build for auth-service
- Trivy image scan for critical vulnerabilities

PostgreSQL is included in CI as a service container because auth-service registration and login tests need a real database.

Docker image build is included because Dockerfile problems should be caught before deployment work begins.

Security checks are included because DevSecOps means checking dependencies and container images early, not after release.

Full guide:

```text
docs/ci-guide.md
```

## GitHub Actions Security Workflow

The dedicated auth-service security workflow lives here:

```text
.github/workflows/auth-service-security.yml
```

It runs on pushes and pull requests to `main` and `develop`, and it can be started manually.

The workflow runs:

- Gitleaks secret scanning
- Semgrep SAST source scanning
- npm audit dependency scanning
- Trivy Docker image scanning

This is separate from the CI workflow so security checks are easy to find and review.

Stop stack:

```bash
docker compose -f docker/docker-compose.auth.yml down
```
