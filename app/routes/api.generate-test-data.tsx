/**
 * Test Data Generation API Endpoint
 *
 * Admin-only endpoint to generate sample analytics data for testing.
 * This populates the database with realistic test data when the widget hasn't been used yet.
 *
 * Usage: POST /api/generate-test-data
 * Body: { shop: "your-shop.myshopify.com" }
 */

import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma as db } from "../db.server";
import { logger } from "../lib/logger.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Authenticate the request
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.info({ shop }, '🎯 Generating test data for shop');

    // Generate data for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

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
        intentBreakdown: JSON.stringify({
          PRODUCT_SEARCH: Math.floor(totalMessages * 0.4),
          GENERAL_CHAT: Math.floor(totalMessages * 0.3),
          SUPPORT: Math.floor(totalMessages * 0.2),
          OTHER: Math.floor(totalMessages * 0.1),
        }),
        sentimentBreakdown: JSON.stringify({
          positive: Math.floor(totalMessages * 0.6),
          neutral: Math.floor(totalMessages * 0.3),
          negative: Math.floor(totalMessages * 0.1),
        }),
        workflowBreakdown: JSON.stringify({
          default: totalMessages,
          custom: 0,
        }),
      });
    }

    logger.info({ count: analyticsRecords.length }, '📊 Creating ChatAnalytics records');

    // Use upsert to avoid conflicts
    for (const record of analyticsRecords) {
      await db.chatAnalytics.upsert({
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

    logger.info('✅ Created ChatAnalytics records');

    // Create a test UserProfile
    const userProfile = await db.userProfile.upsert({
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

    logger.info({ userProfileId: userProfile.id }, '✅ Created user profile');

    // Create test ChatSession
    const chatSession = await db.chatSession.create({
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

    logger.info({ chatSessionId: chatSession.id }, '✅ Created chat session');

    // Create test ChatMessages
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
      await db.chatMessage.create({
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

    logger.info({ count: messages.length }, '✅ Created chat messages');

    // Verify data was created
    const analyticsCount = await db.chatAnalytics.count({ where: { shop } });
    const sessionCount = await db.chatSession.count({ where: { shop } });
    const messageCount = await db.chatMessage.count({
      where: { session: { shop } },
    });

    logger.info({
      analyticsCount,
      sessionCount,
      messageCount,
    }, '✅ Test data generation complete');

    return json({
      success: true,
      message: 'Test data generated successfully! Reload your dashboard to see the data.',
      data: {
        analyticsRecords: analyticsCount,
        chatSessions: sessionCount,
        chatMessages: messageCount,
      },
    });

  } catch (error) {
    logger.error({ error }, '❌ Error generating test data');
    return json({
      success: false,
      message: 'Failed to generate test data',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
};
