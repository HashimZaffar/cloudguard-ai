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
