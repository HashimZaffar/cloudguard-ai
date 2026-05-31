const config = require('../config/env');
const logger = require('../utils/logger');

function notFoundHandler(req, res) {
  return res.status(404).json({
    message: 'Route not found',
  });
}

function errorHandler(err, req, res, next) {
  void req;
  void next;

  logger.error('Unexpected error', {
    message: err.message,
    stack: config.nodeEnv === 'production' ? undefined : err.stack,
  });

  // We do not expose internal error details to API users.
  return res.status(500).json({
    message: 'Internal server error',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
