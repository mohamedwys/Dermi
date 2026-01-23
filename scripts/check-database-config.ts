/**
 * Database Configuration Checker
 *
 * This script verifies that your DATABASE_URL is properly configured
 * with connection pooling parameters to prevent connection pool timeout errors.
 *
 * Run with: npx tsx scripts/check-database-config.ts
 */

import { PrismaClient } from '@prisma/client';

interface CheckResult {
  check: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  message: string;
  recommendation?: string;
}

async function checkDatabaseConfig() {
  const results: CheckResult[] = [];

  console.log('🔍 Checking Database Configuration...\n');

  // Check 1: DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    results.push({
      check: 'DATABASE_URL exists',
      status: 'FAIL',
      message: 'DATABASE_URL environment variable is not set',
      recommendation: 'Set DATABASE_URL in your .env file or environment variables'
    });
    printResults(results);
    return;
  }

  results.push({
    check: 'DATABASE_URL exists',
    status: 'PASS',
    message: 'DATABASE_URL is configured'
  });

  // Check 2: Connection pooling parameters
  const databaseUrl = process.env.DATABASE_URL;
  const hasConnectionLimit = databaseUrl.includes('connection_limit=');
  const hasPgBouncer = databaseUrl.includes('pgbouncer=true');
  const hasPoolTimeout = databaseUrl.includes('pool_timeout=');
  const hasConnectTimeout = databaseUrl.includes('connect_timeout=');

  if (hasPgBouncer) {
    results.push({
      check: 'PgBouncer configuration',
      status: 'PASS',
      message: 'Using PgBouncer connection pooling (recommended)'
    });
  } else if (hasConnectionLimit) {
    results.push({
      check: 'Connection pooling',
      status: 'PASS',
      message: 'Using direct connection with pooling parameters'
    });

    if (!hasPoolTimeout) {
      results.push({
        check: 'Pool timeout',
        status: 'WARN',
        message: 'pool_timeout parameter not set',
        recommendation: 'Add &pool_timeout=20 to DATABASE_URL for better timeout handling'
      });
    }

    if (!hasConnectTimeout) {
      results.push({
        check: 'Connect timeout',
        status: 'WARN',
        message: 'connect_timeout parameter not set',
        recommendation: 'Add &connect_timeout=30 to DATABASE_URL for better connection handling'
      });
    }
  } else {
    results.push({
      check: 'Connection pooling',
      status: 'FAIL',
      message: 'No connection pooling parameters detected',
      recommendation: 'Add ?connection_limit=10&pool_timeout=20&connect_timeout=30 to your DATABASE_URL'
    });
  }

  // Check 3: Extract connection limit value
  if (hasConnectionLimit) {
    const match = databaseUrl.match(/connection_limit=(\d+)/);
    if (match) {
      const limit = parseInt(match[1]);
      if (limit < 1) {
        results.push({
          check: 'Connection limit value',
          status: 'FAIL',
          message: `connection_limit is ${limit} (too low)`,
          recommendation: 'Set connection_limit to at least 1 (use 1 for serverless, 5-10 for traditional hosting)'
        });
      } else if (limit === 1) {
        results.push({
          check: 'Connection limit value',
          status: 'PASS',
          message: `connection_limit=${limit} (optimal for serverless)`
        });
      } else if (limit <= 10) {
        results.push({
          check: 'Connection limit value',
          status: 'PASS',
          message: `connection_limit=${limit} (good for traditional hosting)`
        });
      } else {
        results.push({
          check: 'Connection limit value',
          status: 'WARN',
          message: `connection_limit=${limit} (may be too high)`,
          recommendation: 'Consider reducing to 5-10 to prevent exhausting database connection pool'
        });
      }
    }
  }

  // Check 4: Test database connection
  console.log('\n🔌 Testing database connection...\n');

  try {
    const prisma = new PrismaClient();
    await prisma.$connect();

    results.push({
      check: 'Database connection',
      status: 'PASS',
      message: 'Successfully connected to database'
    });

    // Check 5: Test simple query
    const sessionCount = await prisma.chatSession.count();
    results.push({
      check: 'Query execution',
      status: 'PASS',
      message: `Successfully executed query (found ${sessionCount} chat sessions)`
    });

    await prisma.$disconnect();
  } catch (error) {
    results.push({
      check: 'Database connection',
      status: 'FAIL',
      message: error instanceof Error ? error.message : String(error),
      recommendation: 'Verify your DATABASE_URL credentials and network connectivity'
    });
  }

  // Print results
  printResults(results);

  // Summary
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const warnCount = results.filter(r => r.status === 'WARN').length;

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80) + '\n');

  if (failCount === 0 && warnCount === 0) {
    console.log('✅ All checks passed! Your database configuration looks good.\n');
  } else if (failCount === 0) {
    console.log(`⚠️  Configuration is functional but has ${warnCount} warning(s).\n`);
    console.log('Consider addressing the warnings for optimal performance.\n');
  } else {
    console.log(`❌ Configuration has ${failCount} critical issue(s) and ${warnCount} warning(s).\n`);
    console.log('Please fix the issues marked as FAIL before deploying.\n');
  }

  console.log('📚 For detailed instructions, see: docs/FIX_CONNECTION_POOL.md\n');
}

function printResults(results: CheckResult[]) {
  console.log('='.repeat(80));
  console.log('🔍 CONFIGURATION CHECKS');
  console.log('='.repeat(80) + '\n');

  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️ ' : '❌';
    console.log(`${icon} ${result.check}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   ${result.message}`);
    if (result.recommendation) {
      console.log(`   💡 Recommendation: ${result.recommendation}`);
    }
    if (index < results.length - 1) {
      console.log('');
    }
  });
}

// Run the checker
checkDatabaseConfig().catch(error => {
  console.error('❌ Error running database config checker:', error);
  process.exit(1);
});
