// app/db.server.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Create Prisma client with optimized configuration for serverless
 *
 * ⚠️ CRITICAL: DATABASE_URL MUST INCLUDE CONNECTION POOLING PARAMETERS ⚠️
 *
 * IF YOU SEE THIS ERROR:
 * "PrismaClientInitializationError: Timed out fetching a new connection from the connection pool"
 *
 * YOUR DATABASE_URL IS MISSING POOLING PARAMETERS!
 *
 * ✅ SOLUTION - Update your DATABASE_URL environment variable:
 *
 * OPTION 1 (RECOMMENDED): With PgBouncer
 * postgresql://user:password@host/db?pgbouncer=true&connection_limit=1
 *
 * OPTION 2: Direct connection with pooling
 * postgresql://user:password@host/db?connection_limit=10&pool_timeout=20&connect_timeout=30
 *
 * Why connection pooling is critical:
 * - Each serverless function instance creates a Prisma client
 * - Without pooling, connections accumulate and exhaust the pool
 * - With proper pooling, each instance uses only necessary connections
 * - PgBouncer provides connection pooling at the database level
 *
 * For detailed instructions, see: docs/FIX_CONNECTION_POOL.md
 *
 * See also:
 * - https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 * - https://vercel.com/docs/storage/vercel-postgres/using-an-orm#prisma
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