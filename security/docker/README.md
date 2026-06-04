# Dockerfile Security Checklist

Dockerfile security means building container images that are smaller, safer, and easier to scan.

Beginner checklist:

- Use official base images when possible.
- Prefer slim or Alpine images where they fit the application.
- Do not copy `.env` files into the image.
- Do not install unnecessary packages.
- Use `.dockerignore` so local files, tests, and secrets stay out of the image.
- Keep images small so scans and deployments are faster.
- Scan images with Trivy before trusting them.
- Avoid hardcoded secrets in Dockerfiles, source code, and Compose files.
- Run the app as a low-privilege user when the image supports it.

For this project, `apps/auth-service/.dockerignore` excludes `.env`, `.env.*`, tests, local dependencies, and Git files from the Docker build context.

For auth-service, the Dockerfile uses the built-in `node` user from the official Node image after dependencies and source files are copied.
