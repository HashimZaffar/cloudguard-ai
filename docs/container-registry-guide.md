# Container Registry Guide

A Docker image is a packaged version of an application.

For auth-service, the image contains the Node.js runtime, production dependencies, source code, and the command used to start the API.

A container registry stores Docker images so other machines can pull and run them.

## What GHCR Is

GHCR means GitHub Container Registry.

It is GitHub's container image registry. This project publishes the auth-service image to:

```text
ghcr.io/<github-owner>/cloudguard-auth-service
```

The workflow lowercases the GitHub owner because container image names should be lowercase.

## Local Image Vs Published Image

A local image exists only on your machine.

Example:

```bash
docker build -t cloudguard-auth-service:local ./apps/auth-service
```

A published image is stored in a registry like GHCR.

Example:

```text
ghcr.io/<github-owner>/cloudguard-auth-service:latest
```

Local images are useful while developing. Published images are useful when CI/CD, servers, or future Kubernetes clusters need to pull the same built artifact.

## How Deployment Uses The Published Image

The deployment Compose file uses the published GHCR image:

```text
docker/docker-compose.deploy.yml
```

It reads the image from:

```text
AUTH_SERVICE_IMAGE
```

Example:

```bash
export AUTH_SERVICE_IMAGE=ghcr.io/<github-owner>/cloudguard-auth-service:latest
```

The tag can be `latest`, a semantic version like `1.0.0`, or a SHA tag like `sha-abc123`.

For real production deployments, prefer a specific version or SHA tag instead of always using `latest`. A pinned tag makes it easier to know exactly what is running and easier to roll back.

## How GitHub Actions Logs In

The publish workflow uses:

```text
secrets.GITHUB_TOKEN
```

GitHub automatically creates this token for workflow runs.

The workflow permission:

```yaml
packages: write
```

allows the workflow to push packages, including Docker images, to GHCR.

The workflow permission:

```yaml
contents: read
```

allows the workflow to check out the repository code before building the image.

## Image Tags

Image tags are labels that point to image versions.

This project creates these tags:

- `latest`: created when publishing from the default branch.
- `sha-<commit-sha>`: points to the exact commit that built the image.
- `<version>`: created from tags like `v1.2.3`.
- `<major>.<minor>`: created from tags like `v1.2.3`, for example `1.2`.

The SHA tag is the safest tag when you need to know exactly which code is running.

## Pull Published Image

After the GitHub Actions publish workflow succeeds, pull the image with:

```bash
docker pull ghcr.io/<github-owner>/cloudguard-auth-service:latest
```

Replace `<github-owner>` with your GitHub user or organization name in lowercase.

## Run Published Image Locally

After pulling, you can run the image:

```bash
docker run --name cloudguard-auth-service -p 5001:5001 --env-file apps/auth-service/.env ghcr.io/<github-owner>/cloudguard-auth-service:latest
```

The app still needs valid environment variables, including `DATABASE_URL` and `JWT_SECRET`.

## Local Validation Before Publishing

Run these commands before pushing to GitHub:

```bash
cd apps/auth-service
npm run format
npm run lint
npm run format:check
npm test
npm run security:audit
cd ../..
docker build -t cloudguard-auth-service:local ./apps/auth-service
docker compose -f docker/docker-compose.auth.yml config
```

The GHCR push itself runs inside GitHub Actions, so it cannot be fully tested locally.
