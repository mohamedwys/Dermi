import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Banner,
  InlineStack,
  Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { prisma as db } from "../db.server";

/**
 * UI page for cleaning up test data
 * Access: /app/cleanup-data
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Get current counts
  const shop = session.shop;
  const [analyticsCount, sessionsCount, messagesCount, ratingsCount] = await Promise.all([
    db.chatAnalytics.count({ where: { shop } }),
    db.chatSession.count({ where: { shop } }),
    db.chatMessage.count({ where: { session: { shop } } }),
    db.chatSession.count({ where: { shop, rating: { not: null } } }),
  ]);

  return json({
    shop,
    currentCounts: {
      analyticsRecords: analyticsCount,
      sessions: sessionsCount,
      messages: messagesCount,
      ratings: ratingsCount,
    },
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
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

    // Delete ALL ChatAnalytics records (test data)
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
      deleted: deleted.count,
      before: beforeCounts,
      after: afterCounts,
    });
  } catch (error: any) {
    return json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
};

export default function CleanupDataPage() {
  const loaderData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Page
      title="Clean Up Test Data"
      backAction={{ url: "/app/analytics-debug" }}
    >
      <BlockStack gap="500">
        {loaderData?.success && (
          <Banner tone="success" title="Test Data Cleaned Successfully">
            <BlockStack gap="200">
              <Text as="p">
                Deleted {loaderData.deleted} test analytics records
              </Text>
              <Text as="p" fontWeight="semibold">
                Preserved:
              </Text>
              <ul>
                <li>{loaderData.after.chatSessions} chat sessions</li>
                <li>{loaderData.after.chatMessages} messages</li>
                <li>{loaderData.after.ratings} ratings</li>
              </ul>
            </BlockStack>
          </Banner>
        )}

        {loaderData?.success === false && (
          <Banner tone="critical" title="Error">
            <Text as="p">{loaderData.error}</Text>
          </Banner>
        )}

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text variant="headingMd" as="h2">
                    What This Does
                  </Text>
                  <Text as="p">
                    This will delete all aggregated analytics data (ChatAnalytics records)
                    from your database. This is the fake/test data that's currently showing
                    on your dashboard.
                  </Text>
                </BlockStack>

                <Box
                  background="bg-surface-warning"
                  padding="400"
                  borderRadius="200"
                >
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h3" fontWeight="semibold">
                      ⚠️ What Will Be Deleted:
                    </Text>
                    <ul style={{ marginLeft: "20px" }}>
                      <li>All ChatAnalytics records (aggregated summaries)</li>
                      <li>Test/fake session counts</li>
                      <li>Test/fake message counts</li>
                    </ul>
                  </BlockStack>
                </Box>

                <Box
                  background="bg-surface-success"
                  padding="400"
                  borderRadius="200"
                >
                  <BlockStack gap="200">
                    <Text variant="headingMd" as="h3" fontWeight="semibold">
                      ✅ What Will Be Preserved:
                    </Text>
                    <ul style={{ marginLeft: "20px" }}>
                      <li>All real chat sessions</li>
                      <li>All real messages</li>
                      <li>All ratings</li>
                      <li>All user profiles</li>
                    </ul>
                  </BlockStack>
                </Box>

                <BlockStack gap="200">
                  <Text variant="headingMd" as="h3">
                    After Cleanup:
                  </Text>
                  <ol style={{ marginLeft: "20px" }}>
                    <li>Dashboard will show 0 conversations (temporarily)</li>
                    <li>Open your widget and send test messages</li>
                    <li>System will automatically create new analytics</li>
                    <li>Dashboard will update with REAL data</li>
                  </ol>
                </BlockStack>

                <Divider />

                <Form method="post">
                  <InlineStack align="end">
                    <Button
                      variant="primary"
                      tone="critical"
                      submit
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Cleaning..." : "Delete Test Data"}
                    </Button>
                  </InlineStack>
                </Form>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
