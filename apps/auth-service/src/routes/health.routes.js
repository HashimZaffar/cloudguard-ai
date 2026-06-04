const express = require('express');
const { checkDatabaseConnection } = require('../utils/health');

const router = express.Router();

function currentTimestamp() {
  return new Date().toISOString();
}

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Liveness check for the Node.js process
 *     responses:
 *       200:
 *         description: Node.js process is alive
 */
router.get('/health', (req, res) => {
  return res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: currentTimestamp(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Readiness check for serving traffic
 *     responses:
 *       200:
 *         description: App is ready and database is connected
 *       503:
 *         description: App is not ready because database is disconnected
 */
router.get('/ready', async (req, res) => {
  const databaseIsConnected = await checkDatabaseConnection();

  if (!databaseIsConnected) {
    return res.status(503).json({
      status: 'not_ready',
      service: 'auth-service',
      database: 'disconnected',
      timestamp: currentTimestamp(),
    });
  }

  return res.json({
    status: 'ready',
    service: 'auth-service',
    database: 'connected',
    timestamp: currentTimestamp(),
  });
});

/**
 * @openapi
 * /health/db:
 *   get:
 *     summary: Detailed database connection health check
 *     responses:
 *       200:
 *         description: Database is connected
 *       503:
 *         description: Database is disconnected
 */
router.get('/health/db', async (req, res) => {
  const databaseIsConnected = await checkDatabaseConnection();

  if (!databaseIsConnected) {
    return res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: currentTimestamp(),
    });
  }

  return res.json({
    status: 'healthy',
    database: 'connected',
    timestamp: currentTimestamp(),
  });
});

module.exports = router;
