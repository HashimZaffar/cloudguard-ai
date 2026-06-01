# Auth Service

The Auth Service is the first backend microservice for CloudGuard AI.

It currently provides simple learning endpoints for:

- Checking if the service is running
- Checking service health
- Registering a user
- Logging in a user

Users are stored in memory only for now. This means all registered users are lost when the service restarts. A real database will be added later.

## Folder Structure

```text
apps/auth-service/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── env.js
│   ├── docs/
│   │   └── swagger.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── request-logger.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── utils/
│       ├── logger.js
│       ├── token.js
│       └── validation.js
├── prisma/
│   ├── schema.prisma
│   └── seed.js
├── tests/
│   └── auth.test.js
├── Dockerfile
├── package.json
├── README.md
├── .dockerignore
├── .env.example
└── .env.test.example
```

## What Each File Does

- `src/app.js` creates the Express app, adds middleware, registers routes, and exports the app for tests.
- `src/server.js` starts the HTTP server on the configured port.
- `src/config/env.js` loads environment variables and exports one config object.
- `src/docs/swagger.js` creates the OpenAPI specification for Swagger UI.
- `src/middleware/auth.middleware.js` protects routes by checking JWT tokens.
- `src/middleware/error.middleware.js` handles unknown routes and unexpected errors.
- `src/middleware/request-logger.middleware.js` logs each completed API request.
- `src/routes/auth.routes.js` contains the API endpoint logic.
- `src/utils/logger.js` creates the Winston logger used by the service.
- `src/utils/token.js` creates JWT tokens after successful login.
- `src/utils/validation.js` contains simple request validation functions.
- `prisma/schema.prisma` defines the PostgreSQL database tables used by Prisma.
- `prisma/seed.js` creates safe demo users for local development.
- `tests/auth.test.js` contains automated API tests using Jest and Supertest.
- `Dockerfile` defines how to build the service into a Docker image.
- `.dockerignore` keeps unnecessary local files out of the Docker build context.
- `.env.example` shows the environment variables this service expects.

## Install Dependencies

From the `apps/auth-service` folder, run:

```bash
npm install
```

## Run In Development Mode

```bash
npm run dev
```

The service will run on port `5001` by default.

## Run Normally

```bash
npm start
```

## Run Tests

```bash
npm test
```

Testing is important because it quickly checks that the API still works after code changes. As the project grows, tests help catch mistakes before Docker, Kubernetes, or CI/CD run the service.

## Code Quality

This service uses ESLint and Prettier to keep the code clean and consistent.

ESLint checks JavaScript for common problems, such as unused variables, missing semicolons, and simple mistakes that can lead to bugs.

Prettier formats code automatically so files use the same style, such as single quotes, semicolons, line width, and trailing commas.

Run linting:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

Check formatting without changing files:

```bash
npm run format:check
```

## Environment Configuration

Environment variables are settings that come from outside the code. They let the same app run differently in development, testing, Docker, Kubernetes, and cloud environments.

This service uses `src/config/env.js` as a central config file. Instead of reading `process.env` in many files, the app reads environment variables in one place and exports a simple `config` object.

Secrets should not be hardcoded because code can be copied, committed, shared, or leaked. Values like `JWT_SECRET` should come from private environment variables or a secret manager in real projects.

Environment variables used by this service:

- `NODE_ENV`: tells the app which environment it is running in, such as `development` or `test`.
- `PORT`: controls which port the service listens on.
- `DATABASE_URL`: tells Prisma how to connect to PostgreSQL.
- `JWT_SECRET`: private value used to sign and verify JWT tokens.
- `JWT_EXPIRES_IN`: controls how long JWT tokens stay valid.
- `RATE_LIMIT_WINDOW_MS`: time window for request rate limiting, in milliseconds.
- `RATE_LIMIT_MAX`: maximum requests allowed during the rate limit window.
- `CORS_ORIGIN`: controls which frontend origin can call this API. `*` allows all origins.

Create a local `.env` file:

```bash
cp .env.example .env
```

Then run the service:

```bash
npm run dev
```

## PostgreSQL and Prisma

This service now stores users in PostgreSQL instead of an in-memory array.

PostgreSQL is a real database. It keeps data even when the Node.js service restarts.

Prisma is an ORM for Node.js. ORM means Object Relational Mapper. It lets the app use JavaScript methods like `prisma.user.findUnique()` instead of writing raw SQL for every query.

In-memory storage was useful for learning, but it erased all users whenever the server restarted. PostgreSQL gives the service persistent user storage.

`DATABASE_URL` is the connection string Prisma uses to reach PostgreSQL. It includes the username, password, host, port, database name, and schema.

A migration is a versioned database change. For example, the first migration creates the `User` table.

From the project root, start PostgreSQL and auth-service:

```bash
docker compose -f docker/docker-compose.auth.yml up -d --build
```

From `apps/auth-service`, create `.env` if it is missing:

```bash
cp .env.example .env
```

Run the first migration:

```bash
npx prisma migrate dev --name init
```

Generate Prisma client:

```bash
npm run db:generate
```

Open Prisma Studio:

```bash
npm run db:studio
```

Test health:

```bash
curl http://localhost:5001/health
```

Register a user:

```bash
curl -X POST http://localhost:5001/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Database Seeding

Seed data is sample data inserted into the database so developers can test the API quickly.

This service has a Prisma seed script that creates two local demo users:

- Admin User: `admin@cloudguard.local` with password `AdminPass123`
- Demo User: `demo@cloudguard.local` with password `DemoPass123`

The seed script still hashes passwords with `bcryptjs`. Plain text passwords are never stored in PostgreSQL.

Use `db:seed` when the database already exists and you only want to add or refresh demo users.

Use `db:reset` when you want to rebuild the local database from scratch. Be careful: `db:reset` deletes local database data.

From the project root, start PostgreSQL:

```bash
docker compose -f docker/docker-compose.auth.yml up -d postgres
```

From `apps/auth-service`, create `.env` if it is missing:

```bash
cp .env.example .env
```

Run database setup:

```bash
npm run db:setup
```

Seed only:

```bash
npm run db:seed
```

Reset local database:

```bash
npm run db:reset
```

Open Prisma Studio:

```bash
npm run db:studio
```

Login with the demo user:

```bash
curl -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@cloudguard.local","password":"DemoPass123"}'
```

## Security and Validation Basics

This service now includes a few beginner-friendly security improvements.

Passwords should be hashed because plain text passwords are dangerous. If an attacker ever sees stored user data, plain text passwords can be used immediately. A hash is a one-way version of the password, so the real password is not stored.

`bcryptjs` hashes passwords before saving them in memory. During login, it compares the entered password with the saved hash.

Helmet adds basic secure HTTP headers to Express responses. These headers help protect the API from some common browser and web security risks.

Rate limiting controls how many requests a client can make in a time window. This service allows 100 requests per 15 minutes and returns a friendly error if that limit is exceeded.

Validation checks that required fields are present and usable before the service tries to process them. This keeps the API predictable and easier to debug.

Duplicate email prevention matters because each user account should have a unique email. Without this check, login and account ownership would become confusing.

## JWT Authentication

JWT means JSON Web Token. It is a signed token that lets the API remember who a user is after login without storing a login session on the server.

Fake tokens are useful for early learning, but they do not prove anything. A real JWT is signed with `JWT_SECRET`, so the server can check that the token was created by this service and was not changed by someone else.

`Authorization: Bearer <token>` means the client is sending an access token in the request header. `Bearer` is the common scheme used for token-based authentication.

The `/profile` route is protected. That means it only works when the request includes a valid JWT in the `Authorization` header. If the token is missing, invalid, or expired, the service returns `401`.

`JWT_SECRET` should never be shared publicly. In a real project, it belongs in a private environment variable or secret manager, not in source code.

## Logging

Logs are records of what happened inside an application. They help developers and DevOps engineers understand requests, errors, timing, and service behavior.

Logs are important in DevOps because they help answer practical questions:

- Which request came in?
- Which endpoint was called?
- What status code was returned?
- How long did the request take?
- What error happened?

Logs are important for AIOps because future AI tools can read logs, summarize incidents, detect patterns, and suggest likely causes.

This service uses Winston for logging. Winston is a popular Node.js logging library that can write structured logs and format them differently for local development or production.

Request logging means the service records useful details after each response finishes. Each request log includes:

- HTTP method
- URL
- status code
- response time in milliseconds
- user agent when available

In development, logs are readable in the terminal. In production, logs use JSON format, which is easier for log systems like Loki or cloud logging tools to process.

Unexpected errors are logged internally, but stack traces are not sent back to API users. Users get a safe response, while developers still have useful error details in logs.

## API Documentation

This service uses Swagger and OpenAPI to document the API.

Swagger is a browser-based UI where developers can view available endpoints, request bodies, response examples, and authentication requirements.

OpenAPI is the standard format used to describe REST APIs. Swagger UI reads the OpenAPI definition and turns it into interactive documentation.

API documentation is important because it helps frontend developers, backend developers, DevOps engineers, testers, and future teammates understand how to use the service without reading all the source code.

Start the service:

```bash
npm run dev
```

Then open this URL in your browser:

```text
http://localhost:5001/api-docs
```

Protected routes like `/profile` require a JWT Bearer token. In Swagger UI, use the authorize option and enter the token from the `/login` response.

## Docker

Docker packages the application, Node.js runtime, and production dependencies into a container image. This helps the service run the same way on different machines.

A Docker image is the packaged blueprint for the app. It contains the app files, dependencies, and startup command.

A Docker container is a running instance of that image. You can start, stop, and remove containers without changing the image.

Docker is useful in DevOps because it makes local development, testing, deployment, and future Kubernetes work more consistent.

`.dockerignore` works like `.gitignore`, but for Docker builds. It keeps files like `node_modules`, tests, local `.env` files, and editor configs out of the image so builds stay smaller and cleaner.

Build Docker image:

```bash
docker build -t cloudguard-auth-service:1.0.0 .
```

Run Docker container:

```bash
docker run --name cloudguard-auth-service -p 5001:5001 --env-file .env cloudguard-auth-service:1.0.0
```

Test service:

```bash
curl http://localhost:5001/health
```

Stop container:

```bash
docker stop cloudguard-auth-service
```

Remove container:

```bash
docker rm cloudguard-auth-service
```

## Docker Compose

A project-level Docker Compose file exists at:

```text
docker/docker-compose.auth.yml
```

From the project root, run:

```bash
docker compose -f docker/docker-compose.auth.yml up --build
```

This currently starts `auth-service` and PostgreSQL. Redis and other services will be added later.

## Test Endpoints With curl

Open another terminal while the service is running.

### Home

```bash
curl http://localhost:5001/
```

Expected response:

```json
{
  "message": "CloudGuard AI Auth Service is running"
}
```

### Health

```bash
curl http://localhost:5001/health
```

Expected response:

```json
{
  "status": "healthy",
  "service": "auth-service"
}
```

### Register

```bash
curl -X POST http://localhost:5001/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Expected response:

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

The password is hashed before it is stored in memory. The password and password hash are not returned in the response.

### Validation Error

```bash
curl -X POST http://localhost:5001/register \
  -H "Content-Type: application/json" \
  -d '{"email":"bad-email","password":"short"}'
```

Expected response:

```json
{
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Email must be valid",
    "Password must be at least 8 characters"
  ]
}
```

### Duplicate Email

Run the successful register command once, then run it again with the same email.

Expected response:

```json
{
  "message": "User already exists"
}
```

### Login

```bash
curl -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected successful response:

```json
{
  "message": "Login successful",
  "token": "<real-jwt-token>"
}
```

Expected failed response:

```json
{
  "message": "Invalid email or password"
}
```

### Wrong Password

```bash
curl -X POST http://localhost:5001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong-password"}'
```

Expected response:

```json
{
  "message": "Invalid email or password"
}
```

### Access Profile With Token

First, copy the token from the login response. Then replace `<your-token>` below.

```bash
curl http://localhost:5001/profile \
  -H "Authorization: Bearer <your-token>"
```

Expected response:

```json
{
  "message": "Profile fetched successfully",
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Access Profile Without Token

```bash
curl http://localhost:5001/profile
```

Expected response:

```json
{
  "message": "Authentication token is required"
}
```

## Beginner Notes

The app and server are separated on purpose. Tests can import `src/app.js` without starting a real network server, while `src/server.js` is only responsible for listening on a port.
