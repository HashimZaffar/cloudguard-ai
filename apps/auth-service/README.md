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
│   └── routes/
│       └── auth.routes.js
├── tests/
│   └── auth.test.js
├── package.json
├── README.md
└── .env.example
```

## What Each File Does

- `src/app.js` creates the Express app, adds middleware, registers routes, and exports the app for tests.
- `src/server.js` starts the HTTP server on the configured port.
- `src/routes/auth.routes.js` contains the API endpoint logic.
- `tests/auth.test.js` contains automated API tests using Jest and Supertest.
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

The password is stored temporarily for login testing, but it is not returned in the response.

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
  "token": "fake-jwt-token-for-learning"
}
```

Expected failed response:

```json
{
  "message": "Invalid email or password"
}
```

## Beginner Notes

The app and server are separated on purpose. Tests can import `src/app.js` without starting a real network server, while `src/server.js` is only responsible for listening on a port.

