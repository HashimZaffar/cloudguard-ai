const jwt = require('jsonwebtoken');
const config = require('../config/env');

function generateToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

module.exports = {
  generateToken,
};
