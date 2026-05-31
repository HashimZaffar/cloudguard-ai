const request = require("supertest");
const app = require("../src/app");

describe("Auth Service API", () => {
  test("GET / should return service running message", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("CloudGuard AI Auth Service is running");
  });

  test("GET /health should return service health", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("healthy");
    expect(response.body.service).toBe("auth-service");
  });

  test("POST /register should register a user without returning password", async () => {
    const response = await request(app).post("/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
    expect(response.body.user).toEqual({
      id: 1,
      name: "Test User",
      email: "test@example.com",
    });
    expect(response.body.user.password).toBeUndefined();
  });

  test("POST /login should login successfully after registering a user", async () => {
    await request(app).post("/register").send({
      name: "Login User",
      email: "login@example.com",
      password: "password123",
    });

    const response = await request(app).post("/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.token).toBe("fake-jwt-token-for-learning");
  });

  test("POST /login should fail with wrong password", async () => {
    await request(app).post("/register").send({
      name: "Wrong Password User",
      email: "wrong-password@example.com",
      password: "password123",
    });

    const response = await request(app).post("/login").send({
      email: "wrong-password@example.com",
      password: "wrong-password",
    });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });
});

