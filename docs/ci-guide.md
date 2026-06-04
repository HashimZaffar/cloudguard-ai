# CI Guide

CI means Continuous Integration.

In simple words, CI automatically checks code when someone pushes changes or opens a pull request. It helps catch problems before code is merged.

## What GitHub Actions Is

GitHub Actions is GitHub's built-in automation tool.

It can run commands on a temporary server whenever a repository event happens, such as a push or pull request.

## What A Workflow Is

A workflow is an automation file stored in:

```text
.github/workflows/
```

The auth-service workflow is:

```text
.github/workflows/auth-service-ci.yml
```

It defines when CI runs and what checks should happen.

## What A Job Is

A job is a group of steps that run on the same GitHub Actions runner.

For auth-service, the job runs on an Ubuntu runner.

## What A Step Is

A step is one action inside a job.

Examples:

- checkout code
- install npm dependencies
- run tests
- build a Docker image

## What A Service Container Is

A service container is a temporary container started for the CI job.

Auth-service tests need PostgreSQL, so the workflow starts a PostgreSQL service container before running Prisma migrations and tests.

## Why PostgreSQL Is Started In CI

The auth-service stores users in PostgreSQL.

Registration, login, and profile tests use database tables. Without PostgreSQL, those tests fail because Prisma cannot connect to the database.

## Why CI Runs Tests And Security Checks

Tests check that the service still behaves correctly.

Security checks help catch vulnerable dependencies and risky container images early.

This CI workflow runs:

- `npm run format:check`
- `npm run lint`
- `npm test`
- `npm run security:audit`
- Docker image build
- Trivy image scan for critical vulnerabilities

## How To Read A Failed GitHub Actions Run

Open the failed workflow run in the GitHub Actions tab.

Look for the first failed step. Expand it and read the error message.

Common examples:

- Formatting failed: run `npm run format`.
- Lint failed: fix the JavaScript issue shown by ESLint.
- Tests failed: read the failing test name and error.
- Prisma failed: check the database connection or migration files.
- Docker build failed: check the Dockerfile and build context.
- Security audit failed: review the vulnerability and decide whether dependency updates are safe.

## Local Pre-Push Checklist

Run these commands before pushing.

From `apps/auth-service`:

```bash
npm run format:check
npm run lint
npm test
npm run security:audit
docker build -t cloudguard-auth-service:local .
```

Local tests require PostgreSQL. Start it from the project root if needed:

```bash
docker compose -f docker/docker-compose.auth.yml up -d postgres
```
