FROM node:lts-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy package files first so Docker can cache dependency installation.
COPY package*.json ./

# Prisma needs the schema before generating the client.
COPY prisma ./prisma

# Update npm within the same major version, install dependencies, generate Prisma client, then remove dev dependencies.
RUN npm install -g npm@11.16.0 && npm ci && npx prisma generate && npm prune --omit=dev

# Copy the application source after dependencies are installed.
COPY . .

EXPOSE 5001

# Node.js LTS includes fetch, so we can check /health without adding curl or wget.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://localhost:5001/health').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

# The official Node image includes a low-privilege node user.
USER node

CMD ["npm", "start"]
