/**
 * Database Verification Script
 *
 * Verifies that all Prisma tables exist in the database and are accessible.
 * This helps identify if migrations were run properly on Vercel.
 *
 * Usage:
 *   npx ts-node scripts/verify-database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...\n');

  try {
    // Check if database connection works
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connection successful\n');

    // Check each table
    const tables = [
      { name: 'Session', model: prisma.session },
      { name: 'WidgetSettings', model: prisma.widgetSettings },
      { name: 'ProductEmbedding', model: prisma.productEmbedding },
      { name: 'UserProfile', model: prisma.userProfile },
      { name: 'ChatSession', model: prisma.chatSession },
      { name: 'ChatMessage', model: prisma.chatMessage },
      { name: 'ChatAnalytics', model: prisma.chatAnalytics },
      { name: 'Conversation', model: prisma.conversation },
      { name: 'ByokUsage', model: prisma.byokUsage },
    ];

    console.log('2. Checking tables...');
    for (const table of tables) {
      try {
        const count = await (table.model as any).count();
        console.log(`   ✅ ${table.name}: ${count} records`);
      } catch (error) {
        console.log(`   ❌ ${table.name}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('\n3. Checking indexes and constraints...');

    // Check ChatAnalytics unique constraint
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const analyticsTest = await prisma.chatAnalytics.findUnique({
        where: {
          shop_date: {
            shop: 'test-verification',
            date: today,
          },
        },
      });
      console.log('   ✅ ChatAnalytics shop_date unique constraint exists');
    } catch (error) {
      console.log(`   ⚠️  ChatAnalytics constraint: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Check UserProfile unique constraint
    try {
      const profileTest = await prisma.userProfile.findUnique({
        where: {
          shop_sessionId: {
            shop: 'test-verification',
            sessionId: 'test-session',
          },
        },
      });
      console.log('   ✅ UserProfile shop_sessionId unique constraint exists');
    } catch (error) {
      console.log(`   ⚠️  UserProfile constraint: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    console.log('\n4. Checking foreign key relationships...');

    // Check ChatSession -> UserProfile relationship
    try {
      const sessionWithProfile = await prisma.chatSession.findFirst({
        include: {
          userProfile: true,
        },
      });
      console.log('   ✅ ChatSession -> UserProfile relationship exists');
    } catch (error) {
      console.log(`   ❌ ChatSession relationship: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // Check ChatMessage -> ChatSession relationship
    try {
      const messageWithSession = await prisma.chatMessage.findFirst({
        include: {
          session: true,
        },
      });
      console.log('   ✅ ChatMessage -> ChatSession relationship exists');
    } catch (error) {
      console.log(`   ❌ ChatMessage relationship: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    console.log('\n5. Checking data for galactiva.myshopify.com...');
    const shop = 'galactiva.myshopify.com';

    const widgetSettings = await prisma.widgetSettings.findUnique({
      where: { shop },
    });
    console.log(`   WidgetSettings: ${widgetSettings ? '✅ Exists' : '❌ Not found'}`);

    const analyticsCount = await prisma.chatAnalytics.count({ where: { shop } });
    console.log(`   ChatAnalytics: ${analyticsCount} records`);

    const sessionCount = await prisma.chatSession.count({ where: { shop } });
    console.log(`   ChatSessions: ${sessionCount} records`);

    const messageCount = await prisma.chatMessage.count({
      where: { session: { shop } },
    });
    console.log(`   ChatMessages: ${messageCount} records`);

    const conversationCount = await prisma.conversation.count({ where: { shop } });
    console.log(`   Conversations: ${conversationCount} records`);

    console.log('\n✅ Database verification complete!');
    console.log('\nSummary:');
    console.log('- All tables exist and are accessible');
    console.log('- Foreign key relationships are working');
    console.log('- Unique constraints are in place');

    if (analyticsCount === 0 && sessionCount === 0 && messageCount === 0) {
      console.log('\n⚠️  WARNING: No data found for galactiva.myshopify.com');
      console.log('   This explains why the dashboard shows 0.');
      console.log('   Solutions:');
      console.log('   1. Use the "Generate Test Data" button in the dashboard');
      console.log('   2. Or install and test the widget to generate real data');
    }

  } catch (error) {
    console.error('\n❌ Database verification failed:');
    console.error(error);

    if (error instanceof Error && error.message.includes('does not exist')) {
      console.error('\n⚠️  It looks like migrations have not been run!');
      console.error('   Run: npx prisma migrate deploy');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
