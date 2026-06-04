# Trivy Container Scanning

Trivy is a security scanner from Aqua Security. It can scan container images, filesystems, dependencies, and infrastructure files.

Container image scanning checks the final Docker image for known vulnerabilities in operating system packages and application dependencies.

Docker images can contain vulnerabilities because they include a base operating system layer, Node.js runtime files, npm packages, and application files.

Build the auth-service image from `apps/auth-service`:

```bash
docker build -t cloudguard-auth-service:1.0.0 .
```

Scan the image:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image cloudguard-auth-service:1.0.0
```

Optional filesystem scan from the project root:

```bash
docker run --rm -v "${PWD}:/src" aquasec/trivy:latest fs /src/apps/auth-service
```

Review Trivy findings carefully. Some findings may be fixed by upgrading packages or rebuilding with a newer base image.
