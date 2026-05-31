const express = require("express");

const router = express.Router();

// Temporary in-memory user storage.
// Important: This data disappears when the server restarts.
// A real database will be added in a later phase.
const users = [];

// Simple home route to confirm the service is running.
router.get("/", (req, res) => {
  res.json({
    message: "CloudGuard AI Auth Service is running",
  });
});

// Health route used by developers, Docker, Kubernetes, and monitoring tools later.
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "auth-service",
  });
});

// Register a new user.
// For now, we save the password in memory only for learning login behavior.
// Later, passwords must be hashed before saving to a database.
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  const existingUser = users.find((user) => user.email === email);

  if (existingUser) {
    return res.status(409).json({
      message: "User with this email already exists",
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
  };

  users.push(newUser);

  // Never return the password in an API response.
  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
  });
});

// Login an existing user.
// This checks the in-memory array only. Real JWT authentication comes later.
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    (storedUser) => storedUser.email === email && storedUser.password === password
  );

  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  return res.json({
    message: "Login successful",
    token: "fake-jwt-token-for-learning",
  });
});

module.exports = router;

