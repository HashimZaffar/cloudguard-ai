#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AUTH_SERVICE_DIR="${ROOT_DIR}/apps/auth-service"

print_section() {
  printf '\n== %s ==\n' "$1"
}

docker_is_available() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

print_section "npm audit"
cd "${AUTH_SERVICE_DIR}"
npm run security:audit

if ! docker_is_available; then
  print_section "Docker scans skipped"
  echo "Docker is not available or not running. Start Docker to run Gitleaks, Semgrep, and Trivy."
  exit 0
fi

print_section "Gitleaks secret scan"
cd "${ROOT_DIR}"
docker run --rm -v "${PWD}:/repo" zricethezav/gitleaks:latest detect --source="/repo" --config="/repo/security/gitleaks/gitleaks.toml" --verbose

print_section "Semgrep source scan"
docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config auto /src/apps/auth-service

print_section "Build auth-service Docker image"
cd "${AUTH_SERVICE_DIR}"
docker build -t cloudguard-auth-service:1.0.0 .

print_section "Trivy image scan"
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image cloudguard-auth-service:1.0.0
