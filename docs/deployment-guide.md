# Deployment Guide

CD means Continuous Deployment or Continuous Delivery.

In simple words, CD takes a built application and puts it into an environment where it can run.

For this project, the first CD step is a safe Docker Compose deployment foundation for auth-service. It does not use Kubernetes or cloud deployment yet.

## CI Vs CD

CI checks whether the code is healthy.

CI usually runs formatting checks, linting, tests, security checks, and build checks.

CD deploys a selected build into an environment.

For CloudGuard AI:

- CI checks the auth-service code.
- Docker publishing builds and pushes the auth-service image to GHCR.
- CD pulls a selected GHCR image tag and runs it with Docker Compose.

## Build Vs Publish Vs Deploy

Build means creating a Docker image from the application source code.

Publish means pushing that image to a registry such as GHCR.

Deploy means pulling an image from the registry and running it as a container.

## What Docker Compose Deployment Means

Docker Compose deployment means using a Compose file to run the app and its needed services.

This deployment file is:

```text
docker/docker-compose.deploy.yml
```

It runs:

- auth-service from a published GHCR image
- PostgreSQL for the auth-service database

It does not include Prometheus, Grafana, Loki, Promtail, or Alertmanager yet. Those are part of the larger local monitoring stack.

## What The GHCR Image Is

The GHCR image is the published auth-service Docker image:

```text
ghcr.io/<github-owner>/cloudguard-auth-service:<tag>
```

The `<tag>` can be `latest`, a version like `1.0.0`, or a commit tag like `sha-abc123`.

For real production deployments, prefer a specific version or SHA tag instead of always using `latest`.

## Why A Self-Hosted Runner Is Needed

GitHub-hosted runners are temporary machines created by GitHub.

They can run CI jobs, build images, and publish images. They cannot automatically reach your private laptop or local server unless that machine is publicly reachable and configured for it.

A self-hosted runner is a machine you control that is connected to GitHub Actions.

For local or private server deployment, a self-hosted runner is commonly used because it can run Docker Compose directly on the deployment machine.

The self-hosted runner needs:

- access to this repository
- Docker installed
- Docker Compose installed
- `apps/auth-service/.env` configured on the runner
- permission to pull the GHCR image

Do not commit real secrets into the repository. Keep real `.env` values on the deployment machine.

## Manual Local Deployment

From the project root, create the local environment file if needed:

```bash
cp apps/auth-service/.env.example apps/auth-service/.env
```

Edit `.env` values if needed.

Set the image to deploy:

```bash
export AUTH_SERVICE_IMAGE=ghcr.io/<github-owner>/cloudguard-auth-service:latest
```

Deploy:

```bash
bash scripts/deploy-auth-service.sh
```

Check the service:

```bash
curl http://localhost:5001/health
curl http://localhost:5001/ready
```

If the image does not exist yet, run the Docker publish workflow first.

## GitHub Actions Manual Deployment

The manual deployment workflow is:

```text
.github/workflows/auth-service-deploy-compose.yml
```

It runs only when started manually from the GitHub Actions tab.

Inputs:

- `image_tag`: the image tag to deploy, such as `latest` or `sha-abc123`
- `environment`: the GitHub environment name, such as `local-compose`

Before using it, configure a self-hosted runner on the deployment machine.

The runner must have `apps/auth-service/.env` available. The workflow checks for this file and fails clearly if it is missing.

## Rollback

Rollback means going back to a previous working image.

Use a known previous image tag:

```bash
PREVIOUS_AUTH_SERVICE_IMAGE=ghcr.io/<github-owner>/cloudguard-auth-service:sha-abc123 bash scripts/rollback-auth-service.sh
```

The rollback script pulls the previous image, restarts auth-service, and checks `/health`.

Rollback does not delete database volumes. This is safer for learning because it avoids losing data accidentally.
