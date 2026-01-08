import { useEffect } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Banner,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Box,
  Divider,
  List,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useTranslation } from "react-i18next";
import { logger } from "../lib/logger.server";
import { PLAN_NAMES, isValidPlanName } from "../config/billing";

export const handle = {
  i18n: "common",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);

  logger.debug({ shop: session.shop }, 'Loading billing page');

  const { hasActivePayment, appSubscriptions } = await billing.check({
    plans: PLAN_NAMES as any,
    isTest: process.env.NODE_ENV !== "production",
  });

  logger.debug({
    shop: session.shop,
    hasActivePayment,
    activeSubscriptions: appSubscriptions?.length || 0
  }, 'Billing status checked');

  return json({
    hasActivePayment,
    appSubscriptions,
    shop: session.shop,
    isTestMode: process.env.NODE_ENV !== "production",
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const plan = formData.get("plan") as string;

  logger.info({ shop: session.shop, plan }, 'Billing plan selected');

  if (!plan || !isValidPlanName(plan)) {
    logger.warn({ shop: session.shop, plan }, 'Invalid plan selected');
    return json({ error: "Invalid plan selected" }, { status: 400 });
  }

  // Create billing request and get confirmation URL
  const { confirmationUrl } = await billing.request({
    plan: plan as any,
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `${process.env.SHOPIFY_APP_URL}/app`,
  });

  logger.info({
    shop: session.shop,
    plan,
    isTestMode: process.env.NODE_ENV !== "production"
  }, 'Redirecting to Shopify billing confirmation');

  // Redirect to Shopify's billing confirmation page
  return redirect(confirmationUrl);
};

export default function BillingPage() {
  const { hasActivePayment, appSubscriptions, shop, isTestMode } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const { t } = useTranslation();

  const activePlan = appSubscriptions?.[0];

  const handleSubscribe = (plan: string) => {
    const formData = new FormData();
    formData.append("plan", plan);
    submit(formData, { method: "post" });
  };

  return (
    <Page title={t("billing.title")}>
      <Layout>
        {/* Hero Section */}
        <Layout.Section>
          <Box paddingBlockEnd="600">
            <BlockStack gap="300" align="center">
              <Text as="h1" variant="heading2xl" alignment="center">
                {t("billing.heroTitle")}
              </Text>
              <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                {t("billing.heroSubtitle")}
              </Text>
            </BlockStack>
          </Box>
        </Layout.Section>

        {/* Status Banners */}
        {isTestMode && (
          <Layout.Section>
            <Banner tone="info">
              <BlockStack gap="400">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {t("billing.testMode")}
                </Text>
                <Text as="p" variant="bodyMd">
                  {t("billing.testModeDesc")}
                </Text>
              </BlockStack>
            </Banner>
          </Layout.Section>
        )}

        {hasActivePayment && activePlan && (
          <Layout.Section>
            <Banner tone="success">
              <BlockStack gap="400">
                <Text as="p" variant="bodyMd">
                  <strong>{t("billing.activeSubscription")}:</strong> {activePlan.name}
                </Text>
                {activePlan.trialDays && activePlan.trialDays > 0 && (
                  <Text as="p" variant="bodyMd">
                    🎉 {activePlan.trialDays} {t("billing.daysRemaining")}
                  </Text>
                )}
              </BlockStack>
            </Banner>
          </Layout.Section>
        )}

        {actionData?.error && (
          <Layout.Section>
            <Banner tone="critical">
              <Text as="p" variant="bodyMd">{actionData.error}</Text>
            </Banner>
          </Layout.Section>
        )}

        {/* Pricing Cards */}
        <Layout.Section>
          <InlineStack gap="400" wrap={true} align="center">
            {/* BYOK Plan */}
            <Box minWidth="300px" maxWidth="350px">
              <Card>
                <BlockStack gap="500">
                  {/* Header */}
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="start">
                      <Text as="h2" variant="headingLg" fontWeight="bold">
                        {t("billing.byokPlan") || "BYOK"}
                      </Text>
                      <Badge tone="info">{t("billing.budgetFriendly") || "Budget"}</Badge>
                    </InlineStack>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {t("billing.byokDesc") || "Bring Your Own API Key"}
                    </Text>
                  </BlockStack>

                  {/* Pricing */}
                  <BlockStack gap="100">
                    <InlineStack gap="100" blockAlign="end">
                      <Text as="h3" variant="heading3xl" fontWeight="bold">
                        $5
                      </Text>
                      <Text as="span" variant="bodyLg" tone="subdued">
                        {t("billing.perMonth")}
                      </Text>
                    </InlineStack>
                    <Badge tone="info">{t("billing.freeTrialIncluded")}</Badge>
                  </BlockStack>

                  <Divider />

                  {/* Features */}
                  <BlockStack gap="400">
                    <Text as="p" variant="headingSm" fontWeight="semibold">
                      {t("billing.whatsIncluded")}
                    </Text>
                    <List type="bullet">
                      <List.Item>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          OpenAI integration needed by the user
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Analyses et analyses approfondies
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Intégration webhook N8N personnalisée
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Analyse des sentiments et suivi des intentions
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Profilage et personnalisation utilisateur
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Suivi des clics sur les produits
                        </Text>
                      </List.Item>
                    </List>
                  </BlockStack>

                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={() => handleSubscribe("BYOK Plan")}
                    disabled={hasActivePayment && activePlan?.name === "BYOK Plan"}
                  >
                    {hasActivePayment && activePlan?.name === "BYOK Plan"
                      ? t("billing.currentPlan")
                      : t("billing.startFreeTrial")}
                  </Button>
                </BlockStack>
              </Card>
            </Box>

            {/* Starter Plan */}
            <Box minWidth="300px" maxWidth="350px">
              <Card>
                <BlockStack gap="500">
                  {/* Header */}
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="start">
                      <Text as="h2" variant="headingLg" fontWeight="bold">
                        {t("billing.starterPlan")}
                      </Text>
                      <Badge tone="attention">{t("billing.mostPopular")}</Badge>
                    </InlineStack>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {t("billing.starterDesc")}
                    </Text>
                  </BlockStack>

                  {/* Pricing */}
                  <BlockStack gap="100">
                    <InlineStack gap="100" blockAlign="end">
                      <Text as="h3" variant="heading3xl" fontWeight="bold">
                        $25
                      </Text>
                      <Text as="span" variant="bodyLg" tone="subdued">
                        {t("billing.perMonth")}
                      </Text>
                    </InlineStack>
                    <Badge tone="info">{t("billing.freeTrialIncluded")}</Badge>
                  </BlockStack>

                  <Divider />

                  {/* Features */}
                  <BlockStack gap="400">
                    <Text as="p" variant="headingSm" fontWeight="semibold">
                      {t("billing.whatsIncluded")}
                    </Text>
                    <List type="bullet">
                      <List.Item>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          1,000 conversations/month
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Analyses et analyses approfondies
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Intégration webhook N8N personnalisée
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Analyse des sentiments et suivi des intentions
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Profilage et personnalisation utilisateur
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Suivi des clics sur les produits
                        </Text>
                      </List.Item>
                    </List>
                  </BlockStack>

                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    size="large"
                    fullWidth
                    onClick={() => handleSubscribe("Starter Plan")}
                    disabled={hasActivePayment && activePlan?.name === "Starter Plan"}
                  >
                    {hasActivePayment && activePlan?.name === "Starter Plan"
                      ? t("billing.currentPlan")
                      : t("billing.startFreeTrial")}
                  </Button>
                </BlockStack>
              </Card>
            </Box>

            {/* Professional Plan */}
            <Box minWidth="300px" maxWidth="350px">
              <Card background="bg-surface-selected">
                <BlockStack gap="500">
                  {/* Header */}
                  <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="start">
                      <Text as="h2" variant="headingLg" fontWeight="bold">
                        {t("billing.professionalPlan")}
                      </Text>
                      <Badge tone="success">{t("billing.bestValue")}</Badge>
                    </InlineStack>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {t("billing.professionalDesc")}
                    </Text>
                  </BlockStack>

                  {/* Pricing */}
                  <BlockStack gap="100">
                    <InlineStack gap="100" blockAlign="end">
                      <Text as="h3" variant="heading3xl" fontWeight="bold">
                        $79
                      </Text>
                      <Text as="span" variant="bodyLg" tone="subdued">
                        {t("billing.perMonth")}
                      </Text>
                    </InlineStack>
                    <Badge tone="info">{t("billing.freeTrialIncluded")}</Badge>
                  </BlockStack>

                  <Divider />

                  {/* Features */}
                  <BlockStack gap="400">
                    <Text as="p" variant="headingSm" fontWeight="semibold">
                      {t("billing.whatsIncluded")}
                    </Text>
                    <List type="bullet">
                      <List.Item>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          Conversations illimitées
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Analyses et analyses approfondies
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Intégration webhook N8N personnalisée
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Analyse des sentiments et suivi des intentions
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Profilage et personnalisation utilisateur
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd">
                          Suivi des clics sur les produits
                        </Text>
                      </List.Item>
                      <List.Item>
                        <Text as="span" variant="bodyMd" fontWeight="semibold">
                          Assistance prioritaire (24/7)
                        </Text>
                      </List.Item>
                    </List>
                  </BlockStack>

                  {/* CTA Button */}
                  <Button
                    variant="primary"
                    tone="success"
                    size="large"
                    fullWidth
                    onClick={() => handleSubscribe("Professional Plan")}
                    disabled={hasActivePayment && activePlan?.name === "Professional Plan"}
                  >
                    {hasActivePayment && activePlan?.name === "Professional Plan"
                      ? t("billing.currentPlan")
                      : t("billing.startFreeTrial")}
                  </Button>
                </BlockStack>
              </Card>
            </Box>
          </InlineStack>
        </Layout.Section>

        {/* Comparison Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingLg" alignment="center">
                {t("billing.comparePlans")}
              </Text>
              <InlineStack align="center" gap="400">
                <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">BYOK</Text>
                <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">Starter</Text>
                <Text as="p" variant="bodySm" fontWeight="semibold" tone="subdued">Professional</Text>
              </InlineStack>
              <Divider />
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Conversations mensuelles
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">∞</Text>
                    <Text as="span" variant="bodyMd">1,000</Text>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">∞</Text>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Intégration OpenAI
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">User</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Analyses approfondies
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Webhook N8N personnalisé
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Analyse des sentiments
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Profilage utilisateur
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Suivi des produits
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                    <Text as="span" variant="bodyMd">✓</Text>
                  </InlineStack>
                </InlineStack>
                <Divider />
                <InlineStack align="space-between">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Support
                  </Text>
                  <InlineStack gap="600">
                    <Text as="span" variant="bodyMd">Email</Text>
                    <Text as="span" variant="bodyMd">Email</Text>
                    <Text as="span" variant="bodyMd" fontWeight="semibold">24/7</Text>
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* FAQ Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <Text as="h3" variant="headingLg" alignment="center">
                {t("billing.faq")}
              </Text>

              <BlockStack gap="400">
                <BlockStack gap="400">
                  <Text as="p" variant="bodyLg" fontWeight="semibold">
                    {t("billing.faqChangePlansQ")}
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {t("billing.faqChangePlansA")}
                  </Text>
                </BlockStack>

                <Divider />

                <BlockStack gap="400">
                  <Text as="p" variant="bodyLg" fontWeight="semibold">
                    {t("billing.faqTrialQ")}
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {t("billing.faqTrialA")}
                  </Text>
                </BlockStack>

                <Divider />

                <BlockStack gap="400">
                  <Text as="p" variant="bodyLg" fontWeight="semibold">
                    {t("billing.faqRefundQ")}
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {t("billing.faqRefundA")}
                  </Text>
                </BlockStack>

                <Divider />

                <BlockStack gap="400">
                  <Text as="p" variant="bodyLg" fontWeight="semibold">
                    {t("billing.faqConversationQ")}
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {t("billing.faqConversationA")}
                  </Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Trust Section */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400" align="center">
              <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                {t("billing.trustTitle")}
              </Text>
              <InlineStack gap="600" align="center">
                <BlockStack gap="100" align="center">
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    98%
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {t("billing.customerSatisfaction")}
                  </Text>
                </BlockStack>
                <Divider />
                <BlockStack gap="100" align="center">
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    24/7
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {t("billing.prioritySupport")}
                  </Text>
                </BlockStack>
                <Divider />
                <BlockStack gap="100" align="center">
                  <Text as="p" variant="heading2xl" fontWeight="bold">
                    30-Day
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {t("billing.moneyBackGuarantee")}
                  </Text>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}