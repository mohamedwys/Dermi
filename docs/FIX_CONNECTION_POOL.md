# Fix Database Connection Pool Issues

## Problem
Prisma connection pool timeout errors:
```
PrismaClientInitializationError: Timed out fetching a new connection from the connection pool
Current connection pool timeout: 10, connection limit: 5
```

## Root Cause
The `DATABASE_URL` environment variable is missing critical connection pooling parameters needed for serverless/Vercel deployments.

## Solution

### Step 1: Update DATABASE_URL in Production

Your `DATABASE_URL` must include connection pooling parameters. Choose ONE of these configurations:

#### Option A: Using PgBouncer (RECOMMENDED for Vercel/Production)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1"
```

**Why this is best:**
- PgBouncer handles connection pooling at the database level
- Each serverless function uses only 1 connection
- Prevents connection pool exhaustion
- Allows more concurrent Lambda functions

#### Option B: Direct Connection with Pooling
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=20&connect_timeout=30"
```

**Parameters explained:**
- `connection_limit=10`: Maximum connections per instance (increase if needed)
- `pool_timeout=20`: Seconds to wait for a connection (increased from default 10)
- `connect_timeout=30`: Seconds to wait when establishing connection

### Step 2: Update Environment Variables

#### For Vercel:
```bash
# Set in Vercel dashboard or via CLI
vercel env add DATABASE_URL production
# Paste your connection string with pooling parameters
```

#### For Local Development (.env file):
```bash
# Development (can use higher connection limit)
DATABASE_URL="postgresql://user:password@localhost:5432/database?connection_limit=5&pool_timeout=10"

# Direct connection URL (for migrations)
DIRECT_URL="postgresql://user:password@localhost:5432/database"
```

### Step 3: Verify Prisma Client Configuration

The file `app/db.server.ts` should already use singleton pattern (✅ already implemented):

```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  createPrismaClient();

globalForPrisma.prisma = prisma;
```

### Step 4: Reduce Polling Frequency (if applicable)

If your frontend auto-refreshes analytics, ensure it's not too frequent:

```typescript
// ✅ GOOD: Refresh every 60 seconds
useEffect(() => {
  const interval = setInterval(() => {
    revalidator.revalidate();
  }, 60000); // 60 seconds
  return () => clearInterval(interval);
}, [revalidator]);

// ❌ BAD: Refresh every 5 seconds (exhausts connections)
// setInterval(fetchData, 5000);
```

## Testing

After updating DATABASE_URL:

1. **Restart your application**
   ```bash
   # For Vercel
   vercel --prod

   # For local
   npm run dev
   ```

2. **Check logs for connection errors**
   ```bash
   # Should not see "connection pool timeout" errors
   ```

3. **Monitor connection pool**
   - Watch for repeated timeouts
   - Check database active connections
   - Ensure connection count stays within limits

## Expected Results

After fixes:
- ✅ No more connection pool timeout errors
- ✅ Analytics returns actual data
- ✅ Dashboard shows correct numbers
- ✅ Auto-refresh works without exhausting connections

## Additional Resources

- [Prisma Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Vercel Postgres with Prisma](https://vercel.com/docs/storage/vercel-postgres/using-an-orm#prisma)
- [PgBouncer Setup](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#pgbouncer)

## Troubleshooting

### Still seeing connection errors?

1. **Check your database provider's connection limit**
   - Most hosted Postgres services have a maximum connection limit
   - Example: Neon.tech free tier = 100 connections
   - Ensure `connection_limit` in URL doesn't exceed this

2. **Verify environment variables are loaded**
   ```bash
   # In your app, log (safely) to verify
   console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
   console.log('Has pooling params:', process.env.DATABASE_URL?.includes('connection_limit'));
   ```

3. **Check for connection leaks**
   - Ensure all Prisma queries use the singleton client
   - Look for places creating `new PrismaClient()` directly
   - Verify background jobs disconnect properly

4. **Increase connection limit gradually**
   - Start with `connection_limit=1` (serverless)
   - Increase to 5-10 if still seeing timeouts
   - Monitor your database's active connection count

### Analytics showing zero despite having data?

This is a separate issue from connection pooling. See the enhanced logging in `app/services/analytics.service.ts`:

```typescript
// Check logs for:
// 🔍 DEBUG: Total ChatAnalytics records for this shop (all time)
// 🔍 DEBUG: Comparing analytics aggregated data vs raw chat data
```

Possible causes:
- Analytics data not aggregated yet (run sync-analytics)
- Date range filters excluding your data (timezone mismatch)
- Shop parameter not matching exactly (check casing)
