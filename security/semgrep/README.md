# Semgrep Local Scanning

Semgrep is a static code scanning tool. It reads source code and looks for patterns that may be risky.

SAST means Static Application Security Testing. Static means the tool checks code without running the application.

Static code scanning is useful because it can find insecure patterns early, such as unsafe input handling, weak security settings, or risky library usage.

Run Semgrep from the project root with Docker:

```bash
docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config auto /src/apps/auth-service
```

Linux/macOS shells can also use:

```bash
docker run --rm -v "$PWD:/src" semgrep/semgrep semgrep scan --config auto /src/apps/auth-service
```

Semgrep findings should be reviewed carefully. Not every finding is automatically a real vulnerability. Treat each result as something to investigate.
