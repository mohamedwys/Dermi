import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  InlineStack,
  Badge,
  ProgressBar,
  Box,
  Divider,
  Banner,
  InlineGrid,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { checkBillingStatus, requireBilling } from "../lib/billing.server";
import { AnalyticsService } from "../services/analytics.service";
import { prisma as db } from "../db.server";
import { useTranslation } from "react-i18next";
import { getLocaleFromRequest, i18nServer } from "../i18n/i18next.server";
import { logger } from "../lib/logger.server";

export const handle = {
  i18n: "common",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { billing, session } = await authenticate.admin(request);

    // Require active billing subscription to access dashboard
    await requireBilling(billing);

    logger.debug({ shop: session.shop }, 'Session authenticated');
    logger.info({
      shop: session.shop,
      locale: session.locale,
      url: request.url
    }, '🔍 Dashboard loader - Session details');

    const locale = await getLocaleFromRequest(request);
    const t = i18nServer.getFixedT(locale, "common");

    const billingStatus = await checkBillingStatus(billing);
    const analyticsService = new AnalyticsService();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    try {
    // 🔍 DEBUG: Check if tables have any data for this shop
    const analyticsRecordCount = await db.chatAnalytics.count({
      where: { shop: session.shop }
    });
    const chatSessionCount = await db.chatSession.count({
      where: { shop: session.shop }
    });
    const chatMessageCount = await db.chatMessage.count({
      where: { session: { shop: session.shop } }
    });

    logger.info({
      shop: session.shop,
      analyticsRecordCount,
      chatSessionCount,
      chatMessageCount,
      periodStart: thirtyDaysAgo.toISOString(),
      periodEnd: now.toISOString(),
    }, '🔍 DEBUG: Database record counts for shop');

    const overview = await analyticsService.getOverview(session.shop, {
      startDate: thirtyDaysAgo,
      endDate: now,
      days: 30,
    });

    // 🔍 DEBUG: Log overview results
    logger.info({
      shop: session.shop,
      totalSessions: overview.totalSessions,
      totalMessages: overview.totalMessages,
      avgResponseTime: overview.avgResponseTime,
      avgConfidence: overview.avgConfidence,
    }, '🔍 DEBUG: Overview fetched from analytics service');

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaySessions = await db.chatSession.count({
      where: {
        shop: session.shop,
        lastMessageAt: { gte: todayStart },
      },
    });

    // 🔍 DEBUG: Log today's sessions
    logger.info({
      shop: session.shop,
      todaySessionsCount: todaySessions,
      todayStart: todayStart.toISOString(),
    }, '🔍 DEBUG: Today sessions counted');

    type RecentMessage = {
      content: string | null;
      intent: string | null;
    };

    const recentMessages: RecentMessage[] = await db.chatMessage.findMany({
      where: {
        session: { shop: session.shop },
        role: "user",
        timestamp: { gte: thirtyDaysAgo },
      },
      select: { content: true, intent: true },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    // 🔍 DEBUG: Log recent messages count
    logger.info({
      shop: session.shop,
      recentMessagesCount: recentMessages.length,
    }, '🔍 DEBUG: Recent messages fetched');

    const intentCounts: Record<string, { count: number; example: string }> = {};

    recentMessages.forEach((msg) => {
      if (msg.intent && msg.content) {
        if (!intentCounts[msg.intent]) {
          intentCounts[msg.intent] = { count: 0, example: msg.content };
        }
        intentCounts[msg.intent]!.count++;
      }
    });

    const topQuestions = Object.entries(intentCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([, data]) => ({
        question: data.example,
        count: data.count,
      }));

    // Use real satisfaction rating if available, otherwise fall back to sentiment-based calculation
    const satisfaction = overview.satisfactionRating?.averageRating
      ? overview.satisfactionRating.averageRating.toFixed(1)
      : overview.sentimentBreakdown?.positive && overview.totalMessages > 0
        ? ((overview.sentimentBreakdown.positive / overview.totalMessages) * 5).toFixed(1)
        : "0.0";

    const stats = {
      totalConversations: overview.totalSessions || 0,
      activeToday: todaySessions || 0,
      avgResponseTime: overview.avgResponseTime
        ? `${(overview.avgResponseTime / 1000).toFixed(1)}s`
        : "0.0s",
      customerSatisfaction: parseFloat(satisfaction) || 0,
      satisfactionRatingCount: overview.satisfactionRating?.totalRatings || 0,
      topQuestions:
        topQuestions.length > 0
          ? topQuestions
          : [{ question: t("dashboard.noQuestionsYet"), count: 0 }],
    };

    return json({ stats, billingStatus, locale });
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : String(error),
      shop: session.shop,
    }, 'Error fetching dashboard analytics');
    return json({
      stats: {
        totalConversations: 0,
        activeToday: 0,
        avgResponseTime: "0.0s",
        customerSatisfaction: 0,
        satisfactionRatingCount: 0,
        topQuestions: [{ question: t("dashboard.noDataAvailable"), count: 0 }],
      },
      billingStatus,
      locale,
    });
  }
  } catch (authError) {
    // ✅ FIX: Handle authentication errors gracefully (e.g., locale changes)
    logger.error({
      error: authError instanceof Error ? authError.message : String(authError),
      url: request.url,
    }, 'Dashboard authentication error');

    // Re-throw to let Shopify handle the redirect
    throw authError;
  }
};

export default function Index() {
  const { stats, billingStatus } = useLoaderData<typeof loader>();
  const { t } = useTranslation(); // ✅ Safe: runs only on client
  const revalidator = useRevalidator();

  // ✅ FIX: Auto-refresh dashboard data every 60 seconds
  // Reduced from 30s to 60s to prevent database connection pool exhaustion
  useEffect(() => {
    const interval = setInterval(() => {
      if (revalidator.state === "idle") {
        revalidator.revalidate();
      }
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(interval);
  }, [revalidator]);

  return (
    <Page title={t("dashboard.title")} subtitle={t("dashboard.subtitle")}>
      <Layout>
        {/* ✅ FIX: Show loading indicator when data is being refreshed */}
        {revalidator.state === "loading" && (
          <Layout.Section>
            <Banner tone="info">
              <InlineStack gap="200" blockAlign="center">
                <Text variant="bodyMd" as="p">
                  {t("dashboard.refreshingData", { defaultValue: "Refreshing dashboard data..." })}
                </Text>
              </InlineStack>
            </Banner>
          </Layout.Section>
        )}
        {/* Billing Status Banner */}
        {!billingStatus.hasActivePayment && (
          <Layout.Section>
            <Banner
              title={t("dashboard.unlockPotential")}
              tone="warning"
              action={{
                content: t("dashboard.viewPlans"),
                url: "/app/billing",
              }}
            >
              <Text as="p" variant="bodyMd">
                {t("dashboard.freeTierMessage")}
              </Text>
            </Banner>
          </Layout.Section>
        )}

        {billingStatus.hasActivePayment && billingStatus.activePlan && (
          <Layout.Section>
            <Banner
              title={`${billingStatus.activePlan} ${t("dashboard.planActive")}`}
              tone={billingStatus.appSubscriptions[0]?.trialDays && billingStatus.appSubscriptions[0]?.trialDays > 0 ? "info" : "success"}
              action={{
                content: t("dashboard.manageBilling"),
                url: "/app/billing",
              }}
            >
              <Text as="p" variant="bodyMd">
                {billingStatus.appSubscriptions[0]?.trialDays && billingStatus.appSubscriptions[0]?.trialDays > 0 ? (
                  <>
                    Free trial active with {billingStatus.appSubscriptions[0].trialDays} days remaining.
                    {billingStatus.appSubscriptions[0]?.test && <> {t("dashboard.testModeNote")}</>}
                  </>
                ) : (
                  <>
                    {t("dashboard.subscriptionActive")}
                    {billingStatus.appSubscriptions[0]?.test && <> {t("dashboard.testModeNote")}</>}
                  </>
                )}
              </Text>
            </Banner>
          </Layout.Section>
        )}

        {/* Key Metrics Section */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              {t("dashboard.performanceOverview")}
            </Text>

            <InlineGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="400">
              {[
                {
                  label: t("dashboard.totalConversations"),
                  value: stats.totalConversations.toLocaleString(),
                  badge: t("dashboard.allTime"),
                  note: t("dashboard.growthLastMonth"),
                },
                {
                  label: t("dashboard.activeToday"),
                  value: stats.activeToday,
                  badge: t("dashboard.live"),
                  note: t("dashboard.conversationsStarted"),
                },
                {
                  label: t("dashboard.responseTime"),
                  value: stats.avgResponseTime,
                  badge: t("dashboard.avg"),
                  note: t("dashboard.aiProcessingSpeed"),
                },
                {
                  label: t("dashboard.satisfactionScore"),
                  value: stats.customerSatisfaction,
                  badge: t("dashboard.excellent"),
                  note: stats.satisfactionRatingCount > 0
                    ? `Based on ${stats.satisfactionRatingCount} rating${stats.satisfactionRatingCount !== 1 ? 's' : ''}`
                    : t("dashboard.basedOnFeedback"),
                  suffix: t("dashboard.outOf5"),
                },
              ].map((metric, idx) => (
                <Card key={idx}>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text variant="bodyMd" as="p" tone="subdued">
                        {metric.label}
                      </Text>
                      <Badge tone="info-strong">{metric.badge}</Badge>
                    </BlockStack>
                    <InlineStack gap="200" blockAlign="baseline" wrap={false}>
                      <Text variant="heading2xl" as="p">
                        {metric.value}
                      </Text>
                      {metric.suffix && (
                        <Text variant="bodyMd" as="p" tone="subdued">
                          {metric.suffix}
                        </Text>
                      )}
                    </InlineStack>
                    <Text variant="bodySm" as="p" tone="subdued">
                      {metric.note}
                    </Text>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          </BlockStack>
        </Layout.Section>

        {/* Main Content Grid */}
        <Layout.Section>
          <InlineGrid
            columns={{ xs: 1, md: 2 }}
            gap="400"
            alignItems="start"
          >
            {/* System Status Card */}
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h3">
                    {t("dashboard.systemStatus")}
                  </Text>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    {t("dashboard.monitorComponents")}
                  </Text>
                </BlockStack>

                <BlockStack gap="300">
                  {([
                    {
                      title: t("dashboard.aiAssistant"),
                      desc: t("dashboard.coreChatbot"),
                      badge: t("dashboard.active"),
                      tone: "success",
                    },
                    {
                      title: t("dashboard.themeIntegration"),
                      desc: t("dashboard.widgetEmbedded"),
                      badge: t("dashboard.enabled"),
                      tone: "success",
                    },
                    {
                      title: t("dashboard.n8nWebhook"),
                      desc: t("dashboard.advancedWorkflow"),
                      badge: t("dashboard.fallback"),
                      tone: "warning",
                    },
                    {
                      title: t("dashboard.analyticsTracking"),
                      desc: t("dashboard.dataCollection"),
                      badge: t("dashboard.running"),
                      tone: "success",
                    },
                  ] as const).map((item, i, arr) => (
                    <BlockStack gap="300" key={i}>
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <Text variant="bodyMd" fontWeight="semibold" as="p">
                            {item.title}
                          </Text>
                          <Text variant="bodySm" tone="subdued" as="p">
                            {item.desc}
                          </Text>
                        </BlockStack>
                        <Badge tone={item.tone}>{item.badge}</Badge>
                      </InlineStack>
                      {i < arr.length - 1 && <Divider />}
                    </BlockStack>
                  ))}
                </BlockStack>

                <Button variant="primary" size="large" fullWidth url="/app/settings">
                  {t("dashboard.configureSettings")}
                </Button>
              </BlockStack>
            </Card>

            {/* Top Questions Card */}
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <InlineStack align="space-between" blockAlign="start">
                    <Text variant="headingMd" as="h3">
                      {t("dashboard.topQuestions")}
                    </Text>
                    <Badge tone="info">{t("dashboard.last7Days")}</Badge>
                  </InlineStack>
                  <Text variant="bodyMd" tone="subdued" as="p">
                    {t("dashboard.mostAsked")}
                  </Text>
                </BlockStack>

                <BlockStack gap="300">
                  {stats.topQuestions.map((item, index) => {
                    const maxCount = Math.max(
                      ...stats.topQuestions.map((q) => q.count),
                      1
                    );
                    const percentage = (item.count / maxCount) * 100;

                    return (
                      <BlockStack key={index} gap="200">
                        <InlineStack align="space-between" wrap={false}>
                          <Text as="p" breakWord>
                            {index + 1}. {item.question}
                          </Text>
                          <Badge tone="info-strong">
                            {item.count > 0
                              ? `${item.count}${t("dashboard.timesAsked")}`
                              : t("dashboard.new")}
                          </Badge>
                        </InlineStack>
                        <ProgressBar progress={percentage} size="small" />
                      </BlockStack>
                    );
                  })}
                </BlockStack>

                <Button size="large" fullWidth url="/app/analytics">
                  {t("dashboard.viewFullAnalytics")}
                </Button>
              </BlockStack>
            </Card>
          </InlineGrid>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="start">
                  <Text variant="headingMd" as="h3">
                    {t("dashboard.setupProgress")}
                  </Text>
                  <Badge tone="success">{t("dashboard.stepsCompleted")}</Badge>
                </InlineStack>
                <Text variant="bodyMd" as="p" tone="subdued">
                  {t("dashboard.completeSteps")}
                </Text>
              </BlockStack>

              <ProgressBar progress={100} size="medium" tone="success" />

              <BlockStack gap="300">
                {[
                  {
                    title: t("dashboard.step1Title"),
                    desc: t("dashboard.step1Desc"),
                    completed: true,
                    optional: false,
                  },
                  {
                    title: t("dashboard.step2Title"),
                    desc: t("dashboard.step2Desc"),
                    completed: true,
                    optional: false,
                  },
                  {
                    title: t("dashboard.step3Title"),
                    desc: t("dashboard.step3Desc"),
                    completed: true,
                    optional: false,
                  },
                ].map((step, i) => (
                  <Box
                    key={i}
                    padding="400"
                    background={step.completed ? "bg-surface-secondary" : "bg-surface"}
                    borderRadius="200"
                  >
                    <InlineStack gap="300" align="space-between" blockAlign="start">
                      <InlineStack gap="300" blockAlign="start">
                        <Box paddingBlockStart="050">
                          <Badge tone={step.completed ? "success" : "attention"}>
                            {step.completed ? "✓" : "○"}
                          </Badge>
                        </Box>
                        <BlockStack gap="100">
                          <InlineStack gap="200" blockAlign="center" wrap={false}>
                            <Text variant="bodyMd" as="p" fontWeight="semibold">
                              {step.title}
                            </Text>
                            {step.optional && (
                              <Badge tone="info">{t("dashboard.optional")}</Badge>
                            )}
                          </InlineStack>
                          <Text variant="bodySm" as="p" tone="subdued">
                            {step.desc}
                          </Text>
                        </BlockStack>
                      </InlineStack>
                      {!step.completed && (
                        <Button url="/app/settings">{t("dashboard.connectNow")}</Button>
                      )}
                    </InlineStack>
                  </Box>
                ))}
              </BlockStack>

              <Button variant="primary" url="/app/settings">
                {t("dashboard.customizeWidget")}
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions */}
        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              {t("dashboard.quickActions")}
            </Text>

            <InlineGrid columns={{ xs: 1, sm: 3 }} gap="400">
              {[
                {
                  title: t("dashboard.viewAnalyticsTitle"),
                  desc: t("dashboard.viewAnalyticsDesc"),
                  url: "/app/analytics",
                  label: t("dashboard.openAnalytics"),
                },
                {
                  title: t("dashboard.widgetSettingsTitle"),
                  desc: t("dashboard.widgetSettingsDesc"),
                  url: "/app/settings",
                  label: t("dashboard.configure"),
                },
                {
                  title: t("dashboard.upgradePlanTitle"),
                  desc: t("dashboard.upgradePlanDesc"),
                  url: "/app/billing",
                  label: t("dashboard.viewPlansAction"),
                },
              ].map((action, i) => (
                <Card key={i}>
                  <BlockStack gap="400">
                    <BlockStack gap="200">
                      <Text variant="headingMd" as="h3">
                        {action.title}
                      </Text>
                      <Text variant="bodyMd" as="p" tone="subdued">
                        {action.desc}
                      </Text>
                    </BlockStack>
                    <Button fullWidth url={action.url}>
                      {action.label}
                    </Button>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}