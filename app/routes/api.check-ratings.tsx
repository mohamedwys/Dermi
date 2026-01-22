import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma as db } from "../db.server";
import { authenticate } from "../shopify.server";

/**
 * Diagnostic API to check all ratings in the database
 * Access: GET /api/check-ratings
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    // Get ALL rated sessions (no date filter)
    const allRatedSessions = await db.chatSession.findMany({
      where: {
        shop,
        rating: { not: null },
      },
      orderBy: { ratedAt: 'desc' },
      select: {
        id: true,
        rating: true,
        ratingComment: true,
        ratedAt: true,
        createdAt: true,
        shop: true,
      },
    });

    // Get ratings from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const last7Days = allRatedSessions.filter(
      s => s.ratedAt && s.ratedAt >= sevenDaysAgo
    );

    // Get ratings from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30Days = allRatedSessions.filter(
      s => s.ratedAt && s.ratedAt >= thirtyDaysAgo
    );

    // Calculate statistics
    const avgRating = allRatedSessions.length > 0
      ? allRatedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / allRatedSessions.length
      : 0;

    const distribution = {
      1: allRatedSessions.filter(s => s.rating === 1).length,
      2: allRatedSessions.filter(s => s.rating === 2).length,
      3: allRatedSessions.filter(s => s.rating === 3).length,
      4: allRatedSessions.filter(s => s.rating === 4).length,
      5: allRatedSessions.filter(s => s.rating === 5).length,
    };

    // Get all chat sessions to see how many don't have ratings
    const totalSessions = await db.chatSession.count({ where: { shop } });

    return json({
      shop,
      timestamp: new Date().toISOString(),
      summary: {
        totalChatSessions: totalSessions,
        totalRatings: allRatedSessions.length,
        ratingsLast7Days: last7Days.length,
        ratingsLast30Days: last30Days.length,
        averageRating: Math.round(avgRating * 10) / 10,
        distribution,
        unratedSessions: totalSessions - allRatedSessions.length,
      },
      allRatings: allRatedSessions.map(r => ({
        id: r.id.substring(0, 12) + '...',
        rating: r.rating,
        comment: r.ratingComment ? r.ratingComment.substring(0, 50) + '...' : null,
        ratedAt: r.ratedAt?.toISOString(),
        createdAt: r.createdAt.toISOString(),
        daysAgo: r.ratedAt
          ? Math.floor((Date.now() - r.ratedAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      })),
    });
  } catch (error: any) {
    console.error('Error checking ratings:', error);
    return json(
      { error: 'Failed to check ratings', details: error.message },
      { status: 500 }
    );
  }
};
