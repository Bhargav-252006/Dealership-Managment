const { PrismaClient } = require('@prisma/client');

// Singleton pattern for serverless environments (Vercel)
// Prevents creating a new connection on every function invocation
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production serverless, reuse across warm invocations
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
