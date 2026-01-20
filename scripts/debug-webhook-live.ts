/**
 * Debug script to add runtime logging for webhook URL usage
 * This creates a debug endpoint that shows which webhook URL is actually being used
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugWebhookForShop(shopDomain: string) {
  console.log(`\n🔍 DEBUGGING WEBHOOK FOR SHOP: ${shopDomain}`);
  console.log('='.repeat(60));

  // Check environment variables
  console.log('\n📌 Environment Variables:');
  console.log(`N8N_WEBHOOK_URL: ${process.env.N8N_WEBHOOK_URL || '❌ NOT SET'}`);
  console.log(`N8N_WEBHOOK_BYOK: ${process.env.N8N_WEBHOOK_BYOK || '❌ NOT SET'}`);

  // Fetch shop settings
  try {
    const settings = await prisma.widgetSettings.findUnique({
      where: { shop: shopDomain },
      select: {
        shop: true,
        webhookUrl: true,
        workflowType: true,
        plan: true,
      }
    });

    if (!settings) {
      console.log(`\n❌ No settings found for shop: ${shopDomain}`);
      return;
    }

    console.log('\n📌 Shop Settings:');
    console.log(`Shop: ${settings.shop}`);
    console.log(`Plan: ${settings.plan}`);
    console.log(`Workflow Type: ${settings.workflowType}`);
    console.log(`Custom Webhook: ${settings.webhookUrl || '(null)'}`);

    // Simulate the webhook URL resolution logic from api.widget-settings.tsx
    console.log('\n📌 Webhook URL Resolution:');

    const workflowType = settings.workflowType || 'DEFAULT';
    const plan = settings.plan || 'BASIC';
    let webhookUrl: string | undefined;
    let workflowDescription: string;

    // First check if custom workflow is selected
    if (workflowType === 'CUSTOM') {
      const customWebhookUrl = settings.webhookUrl;
      const isValidCustomUrl = customWebhookUrl &&
                              typeof customWebhookUrl === 'string' &&
                              customWebhookUrl.trim() !== '' &&
                              customWebhookUrl !== 'https://' &&
                              customWebhookUrl !== 'null' &&
                              customWebhookUrl !== 'undefined' &&
                              customWebhookUrl.startsWith('https://') &&
                              customWebhookUrl.length > 8;

      if (isValidCustomUrl) {
        webhookUrl = customWebhookUrl;
        workflowDescription = 'CUSTOM N8N Workflow (merchant webhook)';
        console.log(`✅ Using CUSTOM webhook from database`);
      } else {
        if (plan === 'BYOK') {
          webhookUrl = process.env.N8N_WEBHOOK_BYOK || process.env.N8N_WEBHOOK_URL;
          workflowDescription = 'BYOK Workflow (fallback from invalid custom URL)';
        } else {
          webhookUrl = process.env.N8N_WEBHOOK_URL;
          workflowDescription = 'DEFAULT Workflow (invalid custom URL, using fallback)';
        }
        console.log(`⚠️  Custom workflow selected but URL invalid - falling back`);
      }
    } else {
      // DEFAULT WORKFLOW: Use plan-based webhook routing
      if (plan === 'BYOK') {
        webhookUrl = process.env.N8N_WEBHOOK_BYOK || process.env.N8N_WEBHOOK_URL;
        workflowDescription = 'BYOK Plan Workflow (customer API key)';
        console.log(`✅ Using BYOK plan webhook`);
      } else if (plan === 'Starter') {
        webhookUrl = process.env.N8N_WEBHOOK_URL;
        workflowDescription = 'Starter Plan Workflow ($25/month)';
        console.log(`✅ Using Starter plan webhook`);
      } else if (plan === 'Pro') {
        webhookUrl = process.env.N8N_WEBHOOK_URL;
        workflowDescription = 'Pro Plan Workflow ($79/month)';
        console.log(`✅ Using Pro plan webhook`);
      } else {
        webhookUrl = process.env.N8N_WEBHOOK_URL;
        workflowDescription = 'DEFAULT Workflow (unknown plan)';
        console.log(`⚠️  Unknown plan, using default webhook`);
      }
    }

    console.log('\n📌 FINAL RESULT:');
    console.log(`Workflow Description: ${workflowDescription}`);
    console.log(`➡️  WEBHOOK URL THAT WILL BE USED:`);
    console.log(`    ${webhookUrl || '❌ NOT SET - WILL USE FALLBACK PROCESSING'}`);

    if (!webhookUrl) {
      console.log('\n❌ WARNING: No webhook URL configured!');
      console.log('   The chatbot will use local fallback processing instead of N8N.');
    }

    // Compare with expected URL
    const expectedUrl = 'https://dermadia.app.n8n.cloud/webhook/chat';
    if (webhookUrl && webhookUrl !== expectedUrl) {
      console.log('\n⚠️  MISMATCH DETECTED!');
      console.log(`   Current:  ${webhookUrl}`);
      console.log(`   Expected: ${expectedUrl}`);
      console.log('\n   This is why you\'re calling the OLD webhook!');
    } else if (webhookUrl === expectedUrl) {
      console.log('\n✅ Webhook URL matches expected value!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get shop domain from command line args
const shopDomain = process.argv[2];

if (!shopDomain) {
  console.error('Usage: npm run debug-webhook <shop-domain>');
  console.error('Example: npm run debug-webhook mystore.myshopify.com');
  process.exit(1);
}

debugWebhookForShop(shopDomain);
