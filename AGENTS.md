# CloudGuard AI Agent Guidance

CloudGuard AI is a DevOps, DevSecOps, and AIOps learning platform.

Keep changes small, focused, and beginner-friendly.

Do not add Kubernetes, cloud deployment, or new services unless explicitly requested.

Always preserve existing tests.

Do not add automatic production deployment without an explicit user request.

Deployment workflows should stay manual unless the user asks for automatic deployment.

Never write real secrets into the repository.

Prefer safe rollback documentation when deployment behavior changes.

When changing auth-service behavior, run or recommend:

```bash
npm run format:check
npm run lint
npm test
npm run security:audit
docker compose -f docker/docker-compose.auth.yml config
```

Do not expose passwords, JWT secrets, API keys, or database credentials except obvious fake local examples.

Update documentation when behavior changes.
