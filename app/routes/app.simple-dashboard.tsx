import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, BlockStack, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { prisma as db } from "../db.server";

/**
 * Simplified dashboard WITHOUT:
 * - i18n translations (hardcoded English)
 * - Billing checks
 * - Analytics service
 * - Complex queries
 *
 * This will help identify what's causing the blank screen
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);

    // Simple database query
    let sessionCount = 0;
    try {
      sessionCount = await db.chatSession.count({
        where: { shop: session.shop }
      });
    } catch (dbError: any) {
      console.error("Database query failed:", dbError.message);
    }

    return json({
      success: true,
      shop: session.shop,
      sessionCount,
    });
  } catch (error: any) {
    return json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
};

export default function SimpleDashboard() {
  const data = useLoaderData<typeof loader>();

  if (!data.success) {
    return (
      <Page title="Simple Dashboard - Error">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">Error</Text>
            <Text as="p">{data.error}</Text>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Simple Dashboard (No Translations)"
      subtitle="Testing without i18n"
    >
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Dashboard Loading Test
            </Text>
            <Text as="p">
              Shop: {data.shop}
            </Text>
            <Text as="p">
              Total Conversations: {data.sessionCount}
            </Text>
            <Text as="p" tone="success">
              ✅ This page loaded successfully without using translations!
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              What This Tells Us
            </Text>
            <Text as="p">
              If you can see this page but not the regular dashboard,
              the issue is likely with one of these:
            </Text>
            <BlockStack gap="200">
              <Text as="p">• i18n translation loading</Text>
              <Text as="p">• Analytics service queries</Text>
              <Text as="p">• Complex component rendering</Text>
              <Text as="p">• Billing check (even with SKIP_BILLING_CHECK)</Text>
            </BlockStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
