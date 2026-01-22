import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma as db } from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * Comprehensive diagnostic endpoint to check ALL data in the database
 * Access: GET /api/debug-data (requires Shopify admin login)
 *
 * This shows:
 * - Raw message and session counts
 * - Aggregated ChatAnalytics counts
 * - Whether they match
 * - Sample data from all tables
 * - Date ranges
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // ========== RAW DATA COUNTS ==========
    const [
      totalSessions,
      totalMessages,
      totalUserProfiles,
      totalRatings,
      sessionsLast7Days,
      sessionsLast30Days,
      messagesToday,
      messagesLast7Days,
      messagesLast30Days,
    ] = await Promise.all([
      // Total counts
      db.chatSession.count({ where: { shop } }),
      db.chatMessage.count({ where: { session: { shop } } }),
      db.userProfile.count({ where: { shop } }),
      db.chatSession.count({ where: { shop, rating: { not: null } } }),

      // Sessions by period
      db.chatSession.count({
        where: {
          shop,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
      db.chatSession.count({
        where: {
          shop,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),

      // Messages by period
      db.chatMessage.count({
        where: {
          session: { shop },
          timestamp: { gte: today },
        },
      }),
      db.chatMessage.count({
        where: {
          session: { shop },
          timestamp: { gte: sevenDaysAgo },
        },
      }),
      db.chatMessage.count({
        where: {
          session: { shop },
          timestamp: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // ========== AGGREGATED ANALYTICS COUNTS ==========
    const [
      totalAnalyticsRecords,
      analyticsLast7Days,
      analyticsLast30Days,
    ] = await Promise.all([
      db.chatAnalytics.count({ where: { shop } }),
      db.chatAnalytics.findMany({
        where: {
          shop,
          date: { gte: sevenDaysAgo },
        },
      }),
      db.chatAnalytics.findMany({
        where: {
          shop,
          date: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    // Calculate totals from aggregated data
    const aggregatedLast7Days = {
      sessions: analyticsLast7Days.reduce((sum, a) => sum + a.totalSessions, 0),
      messages: analyticsLast7Days.reduce((sum, a) => sum + a.totalMessages, 0),
    };

    const aggregatedLast30Days = {
      sessions: analyticsLast30Days.reduce((sum, a) => sum + a.totalSessions, 0),
      messages: analyticsLast30Days.reduce((sum, a) => sum + a.totalMessages, 0),
    };

    // ========== SAMPLE DATA ==========
    const [
      recentSessions,
      recentMessages,
      recentAnalytics,
      recentRatings,
    ] = await Promise.all([
      db.chatSession.findMany({
        where: { shop },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          createdAt: true,
          lastMessageAt: true,
          rating: true,
          _count: {
            select: { messages: true },
          },
        },
      }),
      db.chatMessage.findMany({
        where: { session: { shop } },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          id: true,
          role: true,
          content: true,
          intent: true,
          sentiment: true,
          timestamp: true,
        },
      }),
      db.chatAnalytics.findMany({
        where: { shop },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      db.chatSession.findMany({
        where: { shop, rating: { not: null } },
        orderBy: { ratedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
          ratingComment: true,
          ratedAt: true,
        },
      }),
    ]);

    // ========== DATE RANGES ==========
    const oldestMessage = await db.chatMessage.findFirst({
      where: { session: { shop } },
      orderBy: { timestamp: 'asc' },
      select: { timestamp: true },
    });

    const newestMessage = await db.chatMessage.findFirst({
      where: { session: { shop } },
      orderBy: { timestamp: 'desc' },
      select: { timestamp: true },
    });

    const oldestAnalytics = await db.chatAnalytics.findFirst({
      where: { shop },
      orderBy: { date: 'asc' },
      select: { date: true },
    });

    const newestAnalytics = await db.chatAnalytics.findFirst({
      where: { shop },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    return json({
      shop,
      timestamp: now.toISOString(),
      queryPeriods: {
        today: today.toISOString(),
        last7Days: sevenDaysAgo.toISOString(),
        last30Days: thirtyDaysAgo.toISOString(),
      },
      rawDataCounts: {
        totalSessions,
        totalMessages,
        totalUserProfiles,
        totalRatings,
        sessionsLast7Days,
        sessionsLast30Days,
        messagesToday,
        messagesLast7Days,
        messagesLast30Days,
      },
      aggregatedDataCounts: {
        totalAnalyticsRecords,
        analyticsRecordsLast7Days: analyticsLast7Days.length,
        analyticsRecordsLast30Days: analyticsLast30Days.length,
        aggregatedSessionsLast7Days: aggregatedLast7Days.sessions,
        aggregatedMessagesLast7Days: aggregatedLast7Days.messages,
        aggregatedSessionsLast30Days: aggregatedLast30Days.sessions,
        aggregatedMessagesLast30Days: aggregatedLast30Days.messages,
      },
      dataComparison: {
        last7Days: {
          rawSessions: sessionsLast7Days,
          aggregatedSessions: aggregatedLast7Days.sessions,
          match: sessionsLast7Days === aggregatedLast7Days.sessions,
          rawMessages: messagesLast7Days,
          aggregatedMessages: aggregatedLast7Days.messages,
          messagesMatch: messagesLast7Days === aggregatedLast7Days.messages,
        },
        last30Days: {
          rawSessions: sessionsLast30Days,
          aggregatedSessions: aggregatedLast30Days.sessions,
          match: sessionsLast30Days === aggregatedLast30Days.sessions,
          rawMessages: messagesLast30Days,
          aggregatedMessages: aggregatedLast30Days.messages,
          messagesMatch: messagesLast30Days === aggregatedLast30Days.messages,
        },
      },
      dateRanges: {
        messages: {
          oldest: oldestMessage?.timestamp?.toISOString() || null,
          newest: newestMessage?.timestamp?.toISOString() || null,
        },
        analytics: {
          oldest: oldestAnalytics?.date?.toISOString() || null,
          newest: newestAnalytics?.date?.toISOString() || null,
        },
      },
      sampleData: {
        recentSessions: recentSessions.map(s => ({
          id: s.id.substring(0, 12) + '...',
          createdAt: s.createdAt.toISOString(),
          lastMessageAt: s.lastMessageAt.toISOString(),
          messageCount: s._count.messages,
          rating: s.rating,
          daysAgo: Math.floor((now.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
        })),
        recentMessages: recentMessages.map(m => ({
          id: m.id.substring(0, 12) + '...',
          role: m.role,
          contentPreview: m.content?.substring(0, 50) + '...',
          intent: m.intent,
          sentiment: m.sentiment,
          timestamp: m.timestamp.toISOString(),
          hoursAgo: Math.floor((now.getTime() - m.timestamp.getTime()) / (1000 * 60 * 60)),
        })),
        recentAnalytics: recentAnalytics.map(a => ({
          date: a.date.toISOString().split('T')[0],
          totalSessions: a.totalSessions,
          totalMessages: a.totalMessages,
          avgResponseTime: a.avgResponseTime,
          avgConfidence: a.avgConfidence,
          daysAgo: Math.floor((now.getTime() - a.date.getTime()) / (1000 * 60 * 60 * 24)),
        })),
        recentRatings: recentRatings.map(r => ({
          id: r.id.substring(0, 12) + '...',
          rating: r.rating,
          comment: r.ratingComment?.substring(0, 50),
          ratedAt: r.ratedAt?.toISOString(),
        })),
      },
      diagnosis: {
        hasData: totalMessages > 0,
        hasAnalytics: totalAnalyticsRecords > 0,
        analyticsUpToDate: analyticsLast7Days.length > 0,
        dataMatchesAnalytics: sessionsLast7Days === aggregatedLast7Days.sessions,
        possibleIssues: [
          totalMessages === 0 ? "❌ No messages in database - need to send test messages through widget" : null,
          totalAnalyticsRecords === 0 ? "❌ No analytics records - updateAnalytics() not being called" : null,
          totalMessages > 0 && aggregatedLast7Days.messages === 0 ? "❌ Messages exist but not aggregated in last 7 days" : null,
          sessionsLast7Days !== aggregatedLast7Days.sessions ? "⚠️  Raw session count doesn't match aggregated count" : null,
          messagesLast7Days !== aggregatedLast7Days.messages ? "⚠️  Raw message count doesn't match aggregated count" : null,
          totalMessages > 0 && totalAnalyticsRecords > 0 ? "✅ Data looks good!" : null,
        ].filter(Boolean),
      },
    });
  } catch (error: any) {
    console.error('Error in debug-data:', error);
    return json(
      {
        error: 'Failed to fetch debug data',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        note: 'Make sure you are logged into Shopify admin first',
      },
      { status: 500 }
    );
  }
};
