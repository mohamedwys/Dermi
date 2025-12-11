// app/db.server.ts
import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Create Prisma client with optimized configuration
 *
 * Connection pooling is configured via DATABASE_URL:
 * postgresql://user:password@host/db?connection_limit=10&pool_timeout=20
 *
 * For production, we recommend:
 * - connection_limit: 10 (adjust based on your infrastructure)
 * - pool_timeout: 20 (seconds)
 * - connect_timeout: 10 (seconds)
 *
 * See: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management
 */
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });

  // Only extend with Accelerate in production for caching and connection pooling
  if (process.env.NODE_ENV === 'production') {
    return client.$extends(withAccelerate());
  }

  return client;
};

export const prisma =
  globalForPrisma.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect from database
 * Call this in shutdown handlers
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}