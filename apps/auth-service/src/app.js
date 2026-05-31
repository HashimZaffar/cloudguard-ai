const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");

const app = express();

// This middleware lets Express read JSON request bodies.
// Without it, req.body would be undefined in POST routes.
app.use(express.json());

// CORS allows a future frontend dashboard to call this API during development.
app.use(cors());

// Register all auth-service routes.
app.use("/", authRoutes);

module.exports = app;

