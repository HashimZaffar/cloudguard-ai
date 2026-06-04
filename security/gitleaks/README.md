# Gitleaks Secret Scanning

Secret scanning checks files for values that should not be committed to Git.

Secrets include passwords, API keys, private tokens, certificates, and cloud credentials. If real secrets are committed, anyone with repository access may be able to use them.

Gitleaks scans the repository for secret-looking values. This project uses a small config file at `security/gitleaks/gitleaks.toml` that keeps the default Gitleaks rules and only allowlists obvious local demo placeholders.

Run Gitleaks from the project root with Docker:

```bash
docker run --rm -v "${PWD}:/repo" zricethezav/gitleaks:latest detect --source="/repo" --config="/repo/security/gitleaks/gitleaks.toml" --verbose
```

Linux/macOS shells can also use:

```bash
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest detect --source="/repo" --config="/repo/security/gitleaks/gitleaks.toml" --verbose
```

Do not allowlist real secrets. Only obvious fake values used for local learning should be allowlisted.
