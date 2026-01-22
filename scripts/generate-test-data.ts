/**
 * Test Data Generator Script
 *
 * This script generates sample analytics data for testing the dashboard.
 * Run this to populate the database with test data when the widget hasn't been used yet.
 *
 * Usage:
 *   node --loader ts-node/esm scripts/generate-test-data.ts galactiva.myshopify.com
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateTestData(shop: string) {
  console.log(`🎯 Generating test data for shop: ${shop}`);

  try {
    // Generate data for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    console.log(`📅 Date range: ${thirtyDaysAgo.toISOString()} to ${today.toISOString()}`);

    // Create test ChatAnalytics records (daily aggregates)
    const analyticsRecords = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);

      // Vary the numbers to make it realistic
      const totalSessions = Math.floor(Math.random() * 20) + 5;
      const totalMessages = totalSessions * (Math.floor(Math.random() * 5) + 2);

      analyticsRecords.push({
        shop,
        date,
        totalSessions,
        totalMessages,
        avgResponseTime: Math.floor(Math.random() * 2000) + 500, // 500-2500ms
        avgConfidence: 0.7 + Math.random() * 0.25, // 0.7-0.95
        topIntents: JSON.stringify({
          PRODUCT_SEARCH: Math.floor(totalMessages * 0.4),
          GENERAL_CHAT: Math.floor(totalMessages * 0.3),
          SUPPORT: Math.floor(totalMessages * 0.2),
          OTHER: Math.floor(totalMessages * 0.1),
        }),
        topProducts: JSON.stringify({}), // Empty for now
        sentimentBreakdown: JSON.stringify({
          positive: Math.floor(totalMessages * 0.6),
          neutral: Math.floor(totalMessages * 0.3),
          negative: Math.floor(totalMessages * 0.1),
        }),
        workflowUsage: JSON.stringify({
          default: totalMessages,
          custom: 0,
        }),
        conversionsTracked: 0,
      });
    }

    console.log(`📊 Creating ${analyticsRecords.length} ChatAnalytics records...`);

    // Use upsert to avoid conflicts
    for (const record of analyticsRecords) {
      await prisma.chatAnalytics.upsert({
        where: {
          shop_date: {
            shop: record.shop,
            date: record.date,
          },
        },
        update: record,
        create: record,
      });
    }

    console.log(`✅ Created ${analyticsRecords.length} ChatAnalytics records`);

    // Create a few test UserProfiles
    console.log(`👥 Creating test user profiles...`);
    const userProfile = await prisma.userProfile.upsert({
      where: {
        shop_sessionId: {
          shop,
          sessionId: 'test-session-1',
        },
      },
      update: {},
      create: {
        shop,
        sessionId: 'test-session-1',
        customerId: null,
        preferences: JSON.stringify({}),
        browsingHistory: JSON.stringify([]),
        purchaseHistory: JSON.stringify([]),
        interactions: JSON.stringify([]),
      },
    });

    console.log(`✅ Created user profile: ${userProfile.id}`);

    // Create test ChatSession
    console.log(`💬 Creating test chat session...`);
    const chatSession = await prisma.chatSession.create({
      data: {
        shop,
        userProfileId: userProfile.id,
        context: JSON.stringify({
          intent: 'PRODUCT_SEARCH',
          sentiment: 'positive',
          language: 'en',
        }),
        lastMessageAt: new Date(),
        rating: 5,
        ratedAt: new Date(),
      },
    });

    console.log(`✅ Created chat session: ${chatSession.id}`);

    // Create test ChatMessages
    console.log(`📝 Creating test chat messages...`);
    const messages = [
      {
        role: 'user',
        content: 'Show me your bestsellers',
        intent: 'PRODUCT_SEARCH',
        sentiment: 'neutral',
      },
      {
        role: 'assistant',
        content: 'Here are our top-selling products!',
        intent: 'PRODUCT_SEARCH',
        sentiment: 'positive',
      },
      {
        role: 'user',
        content: 'What is your return policy?',
        intent: 'SUPPORT',
        sentiment: 'neutral',
      },
      {
        role: 'assistant',
        content: 'We offer 30-day returns on all items.',
        intent: 'SUPPORT',
        sentiment: 'neutral',
      },
    ];

    for (const msg of messages) {
      await prisma.chatMessage.create({
        data: {
          sessionId: chatSession.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          intent: msg.intent,
          sentiment: msg.sentiment,
          confidence: 0.85,
          productsShown: JSON.stringify([]),
          metadata: JSON.stringify({
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }

    console.log(`✅ Created ${messages.length} chat messages`);

    // Verify data was created
    console.log(`\n🔍 Verifying data...`);
    const analyticsCount = await prisma.chatAnalytics.count({ where: { shop } });
    const sessionCount = await prisma.chatSession.count({ where: { shop } });
    const messageCount = await prisma.chatMessage.count({
      where: { session: { shop } },
    });

    console.log(`✅ Verification complete:`);
    console.log(`   - ChatAnalytics records: ${analyticsCount}`);
    console.log(`   - ChatSession records: ${sessionCount}`);
    console.log(`   - ChatMessage records: ${messageCount}`);

    console.log(`\n🎉 Test data generation complete!`);
    console.log(`\n📊 You can now:`);
    console.log(`   1. Reload your dashboard`);
    console.log(`   2. You should see data instead of 0`);
    console.log(`   3. Try the analytics page too`);

  } catch (error) {
    console.error(`❌ Error generating test data:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Get shop from command line argument
const shop = process.argv[2];

if (!shop) {
  console.error('❌ Error: Shop domain required');
  console.error('Usage: node scripts/generate-test-data.ts <shop-domain>');
  console.error('Example: node scripts/generate-test-data.ts galactiva.myshopify.com');
  process.exit(1);
}

generateTestData(shop)
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
