const prisma = require('../config/prisma');
const logger = require('./logger');

async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    void error;

    logger.warn('Database health check failed');
    return false;
  }
}

module.exports = {
  checkDatabaseConnection,
};
