const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const config = require('./config/env');
const swaggerSpec = require('./docs/swagger');
const authRoutes = require('./routes/auth.routes');
const { requestLogger } = require('./middleware/request-logger.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  message: {
    message: 'Too many requests, please try again later',
  },
});

// Helmet adds basic secure HTTP headers.
app.use(helmet());

// Rate limiting protects the service from too many requests in a short time.
app.use(apiLimiter);

// CORS allows a future frontend dashboard to call this API during development.
app.use(
  cors({
    origin: config.corsOrigin,
  })
);

// This middleware lets Express read JSON request bodies.
// Without it, req.body would be undefined in POST routes.
app.use(express.json());

// Request logging records method, URL, status, and response time.
app.use(requestLogger);

// Swagger UI lets developers view and test API documentation in the browser.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Register all auth-service routes.
app.use('/', authRoutes);

// These middleware functions handle unknown routes and unexpected errors.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
