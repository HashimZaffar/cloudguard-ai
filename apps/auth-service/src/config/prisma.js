const { PrismaClient } = require('@prisma/client');

// Loading env config here makes sure DATABASE_URL is available to Prisma.
require('./env');

const prisma = global.prisma || new PrismaClient();

// In development, reuse the same Prisma client if files reload.
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;
