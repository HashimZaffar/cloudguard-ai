# DevSecOps Guide

DevSecOps means including security in the normal development and operations workflow.

Instead of waiting until the end of a project, we run security checks early and often. This helps catch simple mistakes before they become bigger problems.

This step adds local security scanning before CI/CD is introduced.

## Tools Added

### npm audit

`npm audit` checks npm dependencies for known vulnerabilities.

Run from `apps/auth-service`:

```bash
npm run security:audit
```

Use `npm run security:audit:fix` only when you are ready to let npm update dependency versions.

### Semgrep

Semgrep checks source code for insecure patterns. This is SAST, or Static Application Security Testing.

Run from the project root:

```bash
docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config auto /src/apps/auth-service
```

### Gitleaks

Gitleaks checks the repository for committed secrets.

Run from the project root:

```bash
docker run --rm -v "${PWD}:/repo" zricethezav/gitleaks:latest detect --source="/repo" --config="/repo/security/gitleaks/gitleaks.toml" --verbose
```

### Trivy

Trivy scans Docker images for known vulnerabilities.

Build and scan the auth-service image:

```bash
cd apps/auth-service
docker build -t cloudguard-auth-service:1.0.0 .
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image cloudguard-auth-service:1.0.0
```

## Types Of Security Scanning

SAST checks source code before the app runs. Semgrep is a SAST tool.

Dependency scanning checks third-party packages for known vulnerabilities. `npm audit` checks npm packages.

Secret scanning checks whether passwords, tokens, or keys were accidentally committed. Gitleaks scans for secrets.

Container image scanning checks Docker images for known vulnerabilities. Trivy scans container images.

## How To Read Results

Security scanner findings are signals, not final proof.

Read the file path, severity, and explanation. Then decide whether the finding is a real issue in this project.

Do not hide real secrets or real vulnerabilities. If a tool reports an obvious fake local learning value, allowlist only that exact fake value.

## Local Scan Script

You can also run the helper script from the project root:

```bash
bash security/run-local-security-scans.sh
```

The script runs `npm audit`, then runs Docker-based scans when Docker is available.

## DevSecOps in CI

The auth-service GitHub Actions workflow now runs DevSecOps checks automatically.

`npm audit` runs in CI to check npm dependencies.

The Docker image build runs in CI to catch Dockerfile and build-context problems.

Trivy scans the built image in CI for critical vulnerabilities.

Later, this project can add more security gates, such as Semgrep, Gitleaks, stricter Trivy severity thresholds, and policy checks.

## DevSecOps GitHub Actions Security Workflow

The dedicated security workflow lives here:

```text
.github/workflows/auth-service-security.yml
```

It runs on pushes and pull requests to `main` and `develop`. It can also be started manually from the GitHub Actions tab.

The CI workflow checks whether the app builds and behaves correctly. The security workflow focuses on security signals.

Security workflow jobs:

- Gitleaks checks whether secrets were accidentally committed.
- Semgrep checks source code for risky patterns. This is SAST.
- npm audit checks npm dependencies for known vulnerabilities.
- Trivy scans the Docker image for operating system and package vulnerabilities.

Some findings need human review. For example, a scanner may report a pattern that is risky in one app but acceptable in another because of how authentication or deployment works.

At this stage, Trivy fails the workflow only for critical image vulnerabilities. High findings are still reported, but they do not fail the workflow yet. This keeps the learning workflow practical while still showing important security information.

## Image Publishing Security Note

The Docker publish workflow builds and pushes the auth-service image to GitHub Container Registry.

Security scanning is still handled by the CI and security workflows:

- the CI workflow builds the Docker image and runs a Trivy image scan for critical vulnerabilities
- the security workflow runs Gitleaks, Semgrep, npm audit, and Trivy checks

This keeps publishing simple while still making security checks visible before or alongside publishing.

Later, the project can add stronger supply-chain controls, such as:

- SBOM generation, which lists what is inside the image
- image signing, which proves who created the image
- stricter vulnerability gates before publishing production images
