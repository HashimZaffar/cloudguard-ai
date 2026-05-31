const jwt = require('jsonwebtoken');
const config = require('../config/env');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token is required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch (error) {
    void error;

    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
}

module.exports = {
  authenticate,
};
