import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma as db } from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * Cleanup endpoint to remove test/fake data from ChatAnalytics
 *
 * This endpoint will:
 * 1. Delete all ChatAnalytics records (aggregated test data)
 * 2. Keep real ChatSession and ChatMessage data
 * 3. Allow the system to re-aggregate from real data
 *
 * Access: POST /api/cleanup-test-data
 *
 * IMPORTANT: This only deletes the aggregated analytics data,
 * not your actual conversations, messages, or ratings!
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Get counts before deletion
    const beforeCounts = {
      chatAnalytics: await db.chatAnalytics.count({ where: { shop } }),
      chatSessions: await db.chatSession.count({ where: { shop } }),
      chatMessages: await db.chatMessage.count({ where: { session: { shop } } }),
      ratings: await db.chatSession.count({ where: { shop, rating: { not: null } } }),
    };

    // Delete ALL ChatAnalytics records for this shop
    // These are aggregated/summary records that can be regenerated
    const deleted = await db.chatAnalytics.deleteMany({
      where: { shop },
    });

    // Get counts after deletion
    const afterCounts = {
      chatAnalytics: await db.chatAnalytics.count({ where: { shop } }),
      chatSessions: await db.chatSession.count({ where: { shop } }),
      chatMessages: await db.chatMessage.count({ where: { session: { shop } } }),
      ratings: await db.chatSession.count({ where: { shop, rating: { not: null } } }),
    };

    return json({
      success: true,
      message: "Test data cleaned successfully",
      deleted: {
        chatAnalyticsRecords: deleted.count,
      },
      before: beforeCounts,
      after: afterCounts,
      preserved: {
        chatSessions: afterCounts.chatSessions,
        chatMessages: afterCounts.chatMessages,
        ratings: afterCounts.ratings,
      },
      instructions: [
        "✅ Deleted " + deleted.count + " test analytics records",
        "✅ Preserved all real conversations, messages, and ratings",
        "📝 Next: Send messages through your widget to create new real data",
        "🔄 The system will automatically aggregate new analytics as you chat",
        "📊 Dashboard will show 0 until new conversations are created",
      ],
    });
  } catch (error: any) {
    console.error('Error cleaning test data:', error);
    return json(
      {
        success: false,
        error: 'Failed to clean test data',
        details: error.message,
      },
      { status: 500 }
    );
  }
};

// Handle GET requests with instructions
export const loader = async ({ request }: { request: Request }) => {
  try {
    const { session } = await authenticate.admin(request);

    return json({
      instructions: {
        method: "POST",
        endpoint: "/api/cleanup-test-data",
        description: "Delete test/fake data from ChatAnalytics table",
        warning: "This will remove all aggregated analytics data",
        safe: "Your real conversations, messages, and ratings will NOT be deleted",
        afterCleanup: [
          "1. Dashboard will show 0 conversations (until you create new ones)",
          "2. Open your widget and send test messages",
          "3. System will automatically create new analytics",
          "4. Dashboard will update with REAL data",
        ],
        example: `
curl -X POST https://your-app.vercel.app/api/cleanup-test-data \\
  -H "Cookie: your-session-cookie"
        `,
      },
      currentStats: {
        note: "Use /api/debug-data to see current data counts",
      },
    });
  } catch (error: any) {
    return json(
      {
        error: 'Authentication required',
        note: 'You must be logged into Shopify admin',
      },
      { status: 401 }
    );
  }
};
