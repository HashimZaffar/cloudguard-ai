# CloudGuard AI Architecture

This document explains the planned architecture in beginner-friendly terms.

CloudGuard AI will be built as a cloud-native microservices platform. This means the system will be split into smaller services instead of one large application. Each service will have one main responsibility, making the project easier to understand, test, deploy, and scale.

## Main Parts

- Frontend dashboard: The user interface where users view system data, alerts, and incidents.
- Auth service: Handles login, registration, and authentication.
- User service: Manages user profile and account data.
- Order service: Represents a sample business service for real application behavior.
- Notification service: Sends or records notifications.
- PostgreSQL: Stores important application data.
- Redis: Stores temporary data and can support caching or background jobs.
- Kubernetes: Runs and manages containers.
- GitHub Actions: Automates testing, scanning, and deployment.
- Security tools: Scan source code, secrets, containers, and Kubernetes configuration.
- Monitoring tools: Collect metrics, logs, and alerts.
- AIOps tools: Help summarize logs, explain incidents, and suggest runbooks.

## Simple Architecture Diagram

```text
User
 |
 v
Frontend Dashboard
 |
 v
API / Ingress Layer
 |
 +----------------------+----------------------+----------------------+
 |                      |                      |                      |
 v                      v                      v                      v
Auth Service       User Service          Order Service       Notification Service
 |                      |                      |                      |
 +----------+-----------+----------+-----------+----------+-----------+
            |                      |
            v                      v
       PostgreSQL                 Redis

DevOps and Platform Layer:

GitHub Actions -> Docker Images -> Kubernetes -> Argo CD

Security Layer:

Gitleaks, Semgrep, Trivy, Kubescape, Policies

Monitoring Layer:

Prometheus, Grafana, Loki, Alertmanager

AIOps Layer:

Incident Assistant, Log Summarizer, Runbooks
```

## Why This Architecture Is Useful

This structure looks similar to systems used in real companies. It gives you practice with application development, containers, infrastructure, CI/CD, security, monitoring, and incident response in one project.

