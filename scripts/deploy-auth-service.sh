#!/usr/bin/env bash

set -euo pipefail

echo "== CloudGuard AI auth-service deployment =="

echo
echo "== Checking required tools =="
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or is not available in PATH."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose is not available. Install Docker Compose v2 before deploying."
  exit 1
fi

echo "Docker and Docker Compose are available."

echo
echo "== Checking environment file =="
if [ ! -f apps/auth-service/.env ]; then
  echo "Missing apps/auth-service/.env."
  echo "Create it from the example file, then edit values if needed:"
  echo "cp apps/auth-service/.env.example apps/auth-service/.env"
  exit 1
fi

echo "Environment file found."

echo
echo "== Selecting image =="
export AUTH_SERVICE_IMAGE="${AUTH_SERVICE_IMAGE:-ghcr.io/CHANGE_ME/cloudguard-auth-service:latest}"
echo "AUTH_SERVICE_IMAGE=${AUTH_SERVICE_IMAGE}"

if [[ "${AUTH_SERVICE_IMAGE}" == *"CHANGE_ME"* ]]; then
  echo "Warning: replace CHANGE_ME with your GitHub username or organization."
  echo "Example:"
  echo "export AUTH_SERVICE_IMAGE=ghcr.io/<github-owner>/cloudguard-auth-service:latest"
fi

echo
echo "== Pulling deployment image =="
docker compose -f docker/docker-compose.deploy.yml pull

echo
echo "== Starting deployment =="
docker compose -f docker/docker-compose.deploy.yml up -d

echo
echo "== Running containers =="
docker ps

echo
echo "== Health check =="
curl --fail http://localhost:5001/health

echo
echo "Deployment complete. auth-service is running at http://localhost:5001."
