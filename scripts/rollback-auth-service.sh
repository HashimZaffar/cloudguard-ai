#!/usr/bin/env bash

set -euo pipefail

echo "== CloudGuard AI auth-service rollback =="

if [ -z "${PREVIOUS_AUTH_SERVICE_IMAGE:-}" ]; then
  echo "Missing PREVIOUS_AUTH_SERVICE_IMAGE."
  echo "Example:"
  echo "PREVIOUS_AUTH_SERVICE_IMAGE=ghcr.io/<owner>/cloudguard-auth-service:sha-abc123 ./scripts/rollback-auth-service.sh"
  exit 1
fi

export AUTH_SERVICE_IMAGE="${PREVIOUS_AUTH_SERVICE_IMAGE}"

echo
echo "== Rolling back to image =="
echo "AUTH_SERVICE_IMAGE=${AUTH_SERVICE_IMAGE}"

echo
echo "== Pulling previous image =="
docker compose -f docker/docker-compose.deploy.yml pull auth-service

echo
echo "== Restarting auth-service =="
docker compose -f docker/docker-compose.deploy.yml up -d auth-service

echo
echo "== Health check =="
curl --fail http://localhost:5001/health

echo
echo "Rollback complete. auth-service is running with the previous image."
