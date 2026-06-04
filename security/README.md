# CloudGuard AI Security

This folder contains local DevSecOps scanning documentation and configuration.

Security checks help catch common problems early:

- leaked secrets
- vulnerable dependencies
- risky source code patterns
- Docker image vulnerabilities
- Dockerfile and container configuration issues

## Folder Map

- `security/gitleaks/`: Gitleaks config and secret scanning notes.
- `security/semgrep/`: Semgrep SAST scanning notes.
- `security/trivy/`: Trivy container scanning notes.
- `security/docker/`: Dockerfile security checklist.
- `security/run-local-security-scans.sh`: helper script for local scans.

## Local Scans And GitHub Actions

Local scans help you check your work before pushing.

GitHub Actions security workflows run similar checks automatically after code is pushed or opened in a pull request.

The security workflow is:

```text
.github/workflows/auth-service-security.yml
```

It runs:

- Gitleaks secret scanning
- Semgrep source scanning
- npm audit dependency scanning
- Trivy Docker image scanning

Scanner findings still need human review. A tool can point to a risk, but an engineer decides whether it is a real vulnerability for this project.
