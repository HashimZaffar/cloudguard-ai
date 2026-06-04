const express = require('express');
const { registry } = require('../utils/metrics');

const router = express.Router();

/**
 * @openapi
 * /metrics:
 *   get:
 *     summary: Prometheus metrics endpoint
 *     description: This endpoint is used by Prometheus and returns text/plain metrics, not normal JSON.
 *     responses:
 *       200:
 *         description: Prometheus metrics in text/plain format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       500:
 *         description: Could not collect metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', registry.contentType);
    return res.send(await registry.metrics());
  } catch (error) {
    void error;

    return res.status(500).json({
      message: 'Could not collect metrics',
    });
  }
});

module.exports = router;
