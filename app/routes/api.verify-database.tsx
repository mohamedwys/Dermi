/**
 * Database Verification API Endpoint
 *
 * Admin-only endpoint to verify database setup and check for issues.
 * This helps diagnose problems with missing data or migration issues.
 *
 * Usage: GET /api/verify-database
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma as db } from "../db.server";
import { logger } from "../lib/logger.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Authenticate the request
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    logger.info({ shop }, '🔍 Running database verification');

    const results: any = {
      success: true,
      shop,
      timestamp: new Date().toISOString(),
      tables: {},
      constraints: {},
      relationships: {},
      shopData: {},
    };

    // Check each table
    const tables = [
      { name: 'Session', model: db.session },
      { name: 'WidgetSettings', model: db.widgetSettings },
      { name: 'ProductEmbedding', model: db.productEmbedding },
      { name: 'UserProfile', model: db.userProfile },
      { name: 'ChatSession', model: db.chatSession },
      { name: 'ChatMessage', model: db.chatMessage },
      { name: 'ChatAnalytics', model: db.chatAnalytics },
      { name: 'Conversation', model: db.conversation },
      { name: 'ByokUsage', model: db.byokUsage },
    ];

    for (const table of tables) {
      try {
        const count = await (table.model as any).count();
        results.tables[table.name] = {
          exists: true,
          recordCount: count,
          status: 'ok',
        };
      } catch (error) {
        results.tables[table.name] = {
          exists: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'error',
        };
        results.success = false;
      }
    }

    // Check constraints
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await db.chatAnalytics.findUnique({
        where: {
          shop_date: {
            shop: 'test-verification',
            date: today,
          },
        },
      });
      results.constraints.chatAnalytics_shop_date = 'ok';
    } catch (error) {
      results.constraints.chatAnalytics_shop_date = 'missing or error';
    }

    try {
      await db.userProfile.findUnique({
        where: {
          shop_sessionId: {
            shop: 'test-verification',
            sessionId: 'test-session',
          },
        },
      });
      results.constraints.userProfile_shop_sessionId = 'ok';
    } catch (error) {
      results.constraints.userProfile_shop_sessionId = 'missing or error';
    }

    // Check relationships
    try {
      await db.chatSession.findFirst({
        include: {
          userProfile: true,
        },
      });
      results.relationships.chatSession_userProfile = 'ok';
    } catch (error) {
      results.relationships.chatSession_userProfile = 'error';
    }

    try {
      await db.chatMessage.findFirst({
        include: {
          session: true,
        },
      });
      results.relationships.chatMessage_chatSession = 'ok';
    } catch (error) {
      results.relationships.chatMessage_chatSession = 'error';
    }

    // Check data for current shop
    try {
      const widgetSettings = await db.widgetSettings.findUnique({
        where: { shop },
      });
      results.shopData.widgetSettings = widgetSettings ? 'exists' : 'not found';

      const analyticsCount = await db.chatAnalytics.count({ where: { shop } });
      results.shopData.chatAnalytics = analyticsCount;

      const sessionCount = await db.chatSession.count({ where: { shop } });
      results.shopData.chatSessions = sessionCount;

      const messageCount = await db.chatMessage.count({
        where: { session: { shop } },
      });
      results.shopData.chatMessages = messageCount;

      const conversationCount = await db.conversation.count({ where: { shop } });
      results.shopData.conversations = conversationCount;

      // Determine if data exists
      results.shopData.hasData =
        analyticsCount > 0 ||
        sessionCount > 0 ||
        messageCount > 0 ||
        conversationCount > 0;

    } catch (error) {
      results.shopData.error = error instanceof Error ? error.message : 'Unknown error';
      results.success = false;
    }

    // Generate recommendations
    const recommendations = [];

    if (!results.shopData.hasData) {
      recommendations.push({
        issue: 'No data found for your shop',
        severity: 'warning',
        solutions: [
          'Click "Generate Test Data" button in dashboard',
          'Install and test the widget to generate real data',
          'Verify widget is installed on your Shopify store',
        ],
      });
    }

    const errorTables = Object.entries(results.tables)
      .filter(([_, data]: [string, any]) => data.status === 'error');

    if (errorTables.length > 0) {
      recommendations.push({
        issue: `${errorTables.length} table(s) not accessible`,
        severity: 'critical',
        tables: errorTables.map(([name]) => name),
        solutions: [
          'Run database migrations: npx prisma migrate deploy',
          'Check DATABASE_URL is correct',
          'Verify database permissions',
        ],
      });
    }

    results.recommendations = recommendations;
    results.overallStatus = results.success ? 'healthy' : 'issues_detected';

    logger.info({
      shop,
      status: results.overallStatus,
      hasData: results.shopData.hasData,
    }, '✅ Database verification complete');

    return json(results);

  } catch (error) {
    logger.error({ error }, '❌ Database verification failed');
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Database verification failed',
    }, { status: 500 });
  }
};
