import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, BlockStack, Text } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

/**
 * Simple test page to diagnose admin app loading
 * NO billing check, NO complex queries, NO i18n
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);

    return json({
      success: true,
      shop: session.shop,
      message: "Authentication successful!",
      env: {
        hasApiKey: !!process.env.SHOPIFY_API_KEY,
        skipBillingCheck: process.env.SKIP_BILLING_CHECK,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
};

export default function TestPage() {
  const data = useLoaderData<typeof loader>();

  if (!data.success) {
    return (
      <Page title="Test Page - ERROR">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              ❌ Error Loading Page
            </Text>
            <Text as="p">
              Error: {data.error}
            </Text>
            <Text as="p" tone="subdued">
              <pre>{data.stack}</pre>
            </Text>
          </BlockStack>
        </Card>
      </Page>
    );
  }

  return (
    <Page title="Test Page - SUCCESS ✅">
      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingLg">
            ✅ Admin App is Working!
          </Text>

          <Text as="p">
            <strong>Shop:</strong> {data.shop}
          </Text>

          <Text as="p">
            <strong>Message:</strong> {data.message}
          </Text>

          <Text as="h3" variant="headingMd">
            Environment Check:
          </Text>

          <BlockStack gap="200">
            <Text as="p">
              SHOPIFY_API_KEY: {data.env.hasApiKey ? "✅ Set" : "❌ Missing"}
            </Text>
            <Text as="p">
              SKIP_BILLING_CHECK: {data.env.skipBillingCheck || "Not set"}
            </Text>
            <Text as="p">
              NODE_ENV: {data.env.nodeEnv}
            </Text>
          </BlockStack>

          <Text as="p" tone="success">
            If you can see this page, your app is working correctly!
            The issue is with the dashboard/settings/analytics pages specifically.
          </Text>
        </BlockStack>
      </Card>
    </Page>
  );
}
