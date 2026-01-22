import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { Page, Card, BlockStack, Text, Button, Banner, InlineStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { prisma as db } from "../db.server";
import { createLogger } from "../lib/logger.server";

const logger = createLogger({ service: 'SyncAnalytics' });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Get counts to show user what will be synced
  const [chatSessionCount, chatMessageCount, chatAnalyticsCount] = await Promise.all([
    db.chatSession.count({ where: { shop } }),
    db.chatMessage.count({
      where: {
        session: { shop },
      },
    }),
    db.chatAnalytics.count({ where: { shop } }),
  ]);

  // Get date range of existing messages
  const oldestMessage = await db.chatMessage.findFirst({
    where: {
      session: { shop },
    },
    orderBy: { timestamp: 'asc' },
  });

  const newestMessage = await db.chatMessage.findFirst({
    where: {
      session: { shop },
    },
    orderBy: { timestamp: 'desc' },
  });

  return json({
    shop,
    counts: {
      sessions: chatSessionCount,
      messages: chatMessageCount,
      analyticsRecords: chatAnalyticsCount,
    },
    dateRange: {
      oldest: oldestMessage?.timestamp.toISOString(),
      newest: newestMessage?.timestamp.toISOString(),
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  try {
    logger.info({ shop }, 'Starting analytics sync/backfill');

    // Get all chat messages grouped by date
    const messages = await db.chatMessage.findMany({
      where: {
        session: { shop },
      },
      include: {
        session: {
          include: {
            userProfile: true,
          },
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    logger.info({ shop, totalMessages: messages.length }, 'Fetched messages for sync');

    // Group messages by date
    const messagesByDate = new Map<string, typeof messages>();
    const sessionsByDate = new Map<string, Set<string>>();

    messages.forEach(msg => {
      const date = new Date(msg.timestamp);
      date.setHours(0, 0, 0, 0);
      const dateKey = date.toISOString().split('T')[0];

      if (!messagesByDate.has(dateKey)) {
        messagesByDate.set(dateKey, []);
        sessionsByDate.set(dateKey, new Set());
      }

      messagesByDate.get(dateKey)!.push(msg);
      sessionsByDate.get(dateKey)!.add(msg.sessionId);
    });

    logger.info({
      shop,
      uniqueDates: messagesByDate.size
    }, 'Grouped messages by date');

    // Process each date
    let recordsCreated = 0;
    let recordsUpdated = 0;

    for (const [dateKey, dateMessages] of messagesByDate.entries()) {
      const date = new Date(dateKey);
      date.setHours(0, 0, 0, 0);

      // Calculate aggregated metrics for this date
      const uniqueSessions = sessionsByDate.get(dateKey)!.size;
      const totalMessages = dateMessages.length;

      // Calculate average confidence (only from assistant messages)
      const assistantMessages = dateMessages.filter(m => m.role === 'assistant' && m.confidence !== null);
      const avgConfidence = assistantMessages.length > 0
        ? assistantMessages.reduce((sum, m) => sum + (m.confidence || 0), 0) / assistantMessages.length
        : 0;

      // Calculate average response time (time between user and assistant messages)
      let totalResponseTime = 0;
      let responseTimeCount = 0;

      for (let i = 0; i < dateMessages.length - 1; i++) {
        if (dateMessages[i].role === 'user' && dateMessages[i + 1].role === 'assistant') {
          const responseTime = dateMessages[i + 1].timestamp.getTime() - dateMessages[i].timestamp.getTime();
          totalResponseTime += responseTime;
          responseTimeCount++;
        }
      }

      const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

      // Aggregate intents
      const intentCounts: Record<string, number> = {};
      dateMessages.forEach(m => {
        if (m.intent) {
          intentCounts[m.intent] = (intentCounts[m.intent] || 0) + 1;
        }
      });

      // Aggregate sentiments
      const sentimentCounts: Record<string, number> = {};
      dateMessages.forEach(m => {
        if (m.sentiment) {
          sentimentCounts[m.sentiment] = (sentimentCounts[m.sentiment] || 0) + 1;
        }
      });

      // Aggregate product clicks
      const productClicks: Record<string, number> = {};
      dateMessages.forEach(m => {
        if (m.productClicked) {
          productClicks[m.productClicked] = (productClicks[m.productClicked] || 0) + 1;
        }
      });

      // Upsert ChatAnalytics record
      const existing = await db.chatAnalytics.findUnique({
        where: {
          shop_date: { shop, date },
        },
      });

      await db.chatAnalytics.upsert({
        where: {
          shop_date: { shop, date },
        },
        update: {
          totalSessions: uniqueSessions,
          totalMessages,
          avgResponseTime,
          avgConfidence,
          topIntents: JSON.stringify(intentCounts),
          topProducts: JSON.stringify(productClicks),
          sentimentBreakdown: JSON.stringify(sentimentCounts),
          workflowUsage: JSON.stringify({ default: totalMessages }), // Default since we can't retroactively determine this
        },
        create: {
          shop,
          date,
          totalSessions: uniqueSessions,
          totalMessages,
          avgResponseTime,
          avgConfidence,
          topIntents: JSON.stringify(intentCounts),
          topProducts: JSON.stringify(productClicks),
          sentimentBreakdown: JSON.stringify(sentimentCounts),
          workflowUsage: JSON.stringify({ default: totalMessages }),
        },
      });

      if (existing) {
        recordsUpdated++;
      } else {
        recordsCreated++;
      }

      logger.debug({
        shop,
        date: dateKey,
        sessions: uniqueSessions,
        messages: totalMessages,
      }, 'Synced analytics for date');
    }

    logger.info({
      shop,
      recordsCreated,
      recordsUpdated,
      totalDates: messagesByDate.size,
    }, 'Analytics sync completed successfully');

    return json({
      success: true,
      message: `Successfully synced analytics: ${recordsCreated} records created, ${recordsUpdated} records updated`,
      stats: {
        recordsCreated,
        recordsUpdated,
        totalDates: messagesByDate.size,
      },
    });
  } catch (error: any) {
    logger.error({
      error: error.message,
      shop,
    }, 'Error syncing analytics');

    return json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
};

export default function SyncAnalyticsPage() {
  const data = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";

  const handleSync = () => {
    if (confirm('This will recalculate all analytics from your chat history. Continue?')) {
      submit({}, { method: "post" });
    }
  };

  return (
    <Page
      title="Sync Analytics Data"
      subtitle="Backfill analytics from existing chat data"
      backAction={{ url: "/app/analytics" }}
    >
      <BlockStack gap="500">
        <Banner tone="info">
          <p>
            This tool rebuilds your analytics data from existing chat messages and sessions.
            Use this if your dashboard shows zeros despite having conversation data.
          </p>
        </Banner>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Current Database Status
            </Text>

            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="bodyMd" as="p">
                  Total Chat Sessions:
                </Text>
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  {data.counts.sessions}
                </Text>
              </InlineStack>

              <InlineStack align="space-between">
                <Text variant="bodyMd" as="p">
                  Total Chat Messages:
                </Text>
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  {data.counts.messages}
                </Text>
              </InlineStack>

              <InlineStack align="space-between">
                <Text variant="bodyMd" as="p">
                  Existing Analytics Records:
                </Text>
                <Text variant="bodyMd" as="p" fontWeight="semibold">
                  {data.counts.analyticsRecords}
                </Text>
              </InlineStack>
            </BlockStack>

            {data.dateRange.oldest && data.dateRange.newest && (
              <BlockStack gap="200">
                <Text variant="headingSm" as="h3">
                  Message Date Range
                </Text>
                <Text variant="bodySm" as="p">
                  Oldest: {new Date(data.dateRange.oldest).toLocaleString()}
                </Text>
                <Text variant="bodySm" as="p">
                  Newest: {new Date(data.dateRange.newest).toLocaleString()}
                </Text>
              </BlockStack>
            )}
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text variant="headingMd" as="h2">
              Sync Analytics
            </Text>

            <Text variant="bodyMd" as="p">
              Click the button below to recalculate analytics from your chat history.
              This will create or update ChatAnalytics records for each day that has messages.
            </Text>

            <Button
              onClick={handleSync}
              loading={isLoading}
              variant="primary"
              disabled={data.counts.messages === 0}
            >
              {isLoading ? 'Syncing...' : 'Sync Analytics Now'}
            </Button>

            {data.counts.messages === 0 && (
              <Banner tone="warning">
                <p>No chat messages found. Start using your chatbot to generate analytics data.</p>
              </Banner>
            )}
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              What This Does
            </Text>

            <BlockStack gap="200">
              <Text variant="bodyMd" as="p">
                • Analyzes all chat messages and sessions in your database
              </Text>
              <Text variant="bodyMd" as="p">
                • Groups them by date
              </Text>
              <Text variant="bodyMd" as="p">
                • Calculates metrics: total sessions, messages, avg response time, confidence
              </Text>
              <Text variant="bodyMd" as="p">
                • Aggregates intents, sentiments, and product clicks
              </Text>
              <Text variant="bodyMd" as="p">
                • Creates or updates ChatAnalytics records for each date
              </Text>
              <Text variant="bodyMd" as="p">
                • Makes your dashboard display accurate historical data
              </Text>
            </BlockStack>
          </BlockStack>
        </Card>

        <Banner tone="warning">
          <p>
            <strong>Note:</strong> This operation is safe and can be run multiple times.
            It will update existing analytics records without data loss.
          </p>
        </Banner>
      </BlockStack>
    </Page>
  );
}
