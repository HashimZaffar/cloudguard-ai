# Setup Guide

This guide will grow as the project grows. For now, it lists the tools that will be useful later and the basic commands we expect to use.

## Prerequisites

Install these tools later as the project reaches each phase:

- Git
- Node.js and npm
- Python 3
- Docker
- Docker Compose
- kubectl
- Kind or Minikube
- Terraform
- Helm
- GitHub CLI
- Trivy
- Gitleaks
- Semgrep
- Kubescape

## Basic Setup Steps

1. Clone the repository.
2. Move into the project folder.
3. Read the README and docs.
4. Build one service at a time.
5. Add Docker support.
6. Add Kubernetes support.
7. Add CI/CD and security scanning.
8. Add monitoring, logging, and AIOps features.

## Commands That Will Be Used Later

```bash
# Move into the project
cd cloudguard-ai

# Check Git status
git status

# Install frontend dependencies later
npm install

# Run tests later
npm test

# Build Docker images later
docker build -t cloudguard-ai-service .

# Run local containers later
docker compose up

# Check Kubernetes cluster later
kubectl get nodes

# Apply Kubernetes manifests later
kubectl apply -f k8s/

# Initialize Terraform later
terraform init

# Preview Terraform changes later
terraform plan

# Run security scans later
trivy fs .
gitleaks detect
semgrep scan
kubescape scan
```

## Current Setup Status

Only the initial folder structure and documentation files have been created. No application services are implemented yet.

