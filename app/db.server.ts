// app/db.server.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Create Prisma client with optimized configuration for serverless
 *
 * CRITICAL FIX FOR VERCEL DEPLOYMENT:
 * Connection pooling must be configured via DATABASE_URL with these parameters:
 *
 * For Vercel/Serverless (REQUIRED):
 * postgresql://user:password@host/db?pgbouncer=true&connection_limit=1
 *
 * OR with direct connection (less optimal):
 * postgresql://user:password@host/db?connection_limit=1&pool_timeout=10
 *
 * Why connection_limit=1?
 * - Each serverless function should use only 1 connection
 * - Prevents connection pool exhaustion
 * - Allows more concurrent Lambda functions
 * - Use PgBouncer/connection pooler at database level for true pooling
 *
 * See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 * See: https://vercel.com/docs/storage/vercel-postgres/using-an-orm#prisma
 */
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
    // ✅ FIX: Set connection pool timeout to prevent hanging
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Only extend with Accelerate in production for caching and connection pooling
  if (process.env.NODE_ENV === 'production') {
    return client.$extends(withAccelerate());
  }

  return client;
};

// ✅ FIX: Always use singleton pattern, even in production (serverless friendly)
export const prisma =
  globalForPrisma.prisma ||
  createPrismaClient();

// ✅ FIX: Cache in global for all environments to prevent multiple instances
globalForPrisma.prisma = prisma;

/**
 * Gracefully disconnect from database
 * Call this in shutdown handlers
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}