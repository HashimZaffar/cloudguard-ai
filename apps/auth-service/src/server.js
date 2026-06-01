const app = require('./app');
const config = require('./config/env');
const prisma = require('./config/prisma');
const logger = require('./utils/logger');

const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Auth service is running on port ${config.port}`);
});

async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down auth service.`);

  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Prisma disconnected. Auth service stopped.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
