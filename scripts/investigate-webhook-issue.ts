import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateWebhookIssue() {
  try {
    console.log('🔍 WEBHOOK INVESTIGATION REPORT\n');
    console.log('=' .repeat(60));

    // 1. Check environment variables
    console.log('\n📌 STEP 1: Environment Variables');
    console.log('-'.repeat(60));
    console.log('N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL || '❌ NOT SET');
    console.log('N8N_WEBHOOK_BYOK:', process.env.N8N_WEBHOOK_BYOK || '❌ NOT SET');

    // 2. Check database webhook URLs
    console.log('\n📌 STEP 2: Database Webhook URLs');
    console.log('-'.repeat(60));
    const allSettings = await prisma.widgetSettings.findMany({
      select: {
        shop: true,
        webhookUrl: true,
        workflowType: true,
        plan: true,
      }
    });

    if (allSettings.length === 0) {
      console.log('No shops found in database');
    } else {
      allSettings.forEach((setting: any) => {
        console.log(`\n🏪 Shop: ${setting.shop}`);
        console.log(`   Plan: ${setting.plan}`);
        console.log(`   Workflow Type: ${setting.workflowType}`);
        console.log(`   Custom Webhook URL: ${setting.webhookUrl || '(null - using env var)'}`);

        // Determine which webhook URL will be used
        let effectiveWebhook = '';
        if (setting.workflowType === 'CUSTOM' && setting.webhookUrl) {
          effectiveWebhook = setting.webhookUrl;
        } else if (setting.plan === 'BYOK') {
          effectiveWebhook = process.env.N8N_WEBHOOK_BYOK || process.env.N8N_WEBHOOK_URL || 'NOT SET';
        } else {
          effectiveWebhook = process.env.N8N_WEBHOOK_URL || 'NOT SET';
        }
        console.log(`   ➡️  EFFECTIVE WEBHOOK: ${effectiveWebhook}`);
      });
    }

    // 3. Summary and recommendations
    console.log('\n📌 STEP 3: Summary & Recommendations');
    console.log('-'.repeat(60));

    const shopsWithCustomWebhook = allSettings.filter((s: any) => s.webhookUrl);
    if (shopsWithCustomWebhook.length > 0) {
      console.log(`\n⚠️  WARNING: ${shopsWithCustomWebhook.length} shop(s) have custom webhook URLs in database!`);
      console.log('   These will override environment variables.');
      console.log('   Shops with custom webhooks:');
      shopsWithCustomWebhook.forEach((s: any) => {
        console.log(`   - ${s.shop}: ${s.webhookUrl}`);
      });
    }

    const envWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const envByokUrl = process.env.N8N_WEBHOOK_BYOK;

    if (!envWebhookUrl) {
      console.log('\n❌ ISSUE: N8N_WEBHOOK_URL environment variable is not set!');
      console.log('   This is required for all non-CUSTOM workflow shops.');
    }

    if (!envByokUrl) {
      console.log('\n⚠️  NOTE: N8N_WEBHOOK_BYOK environment variable is not set.');
      console.log('   BYOK plan shops will fall back to N8N_WEBHOOK_URL.');
    }

    // 4. Recommendations
    console.log('\n📌 STEP 4: Action Items');
    console.log('-'.repeat(60));
    console.log('\nTo fix the old webhook issue, you need to:');
    console.log('\n1️⃣  UPDATE VERCEL ENVIRONMENT VARIABLES:');
    console.log('   vercel env pull .env.local');
    console.log('   # Check current values');
    console.log('   vercel env rm N8N_WEBHOOK_URL production');
    console.log('   vercel env add N8N_WEBHOOK_URL production');
    console.log('   # Enter: https://dermadia.app.n8n.cloud/webhook/chat');

    if (shopsWithCustomWebhook.length > 0) {
      console.log('\n2️⃣  CLEAR STALE DATABASE WEBHOOKS:');
      console.log('   Run: npm run fix-webhook-url');
      console.log('   This will clear all custom webhooks from the database.');
    }

    console.log('\n3️⃣  REDEPLOY YOUR APP:');
    console.log('   After updating Vercel env vars, trigger a new deployment.');
    console.log('   The app loads environment variables at startup.');

    console.log('\n4️⃣  VERIFY THE FIX:');
    console.log('   Send a test message through the chatbot');
    console.log('   Check Vercel logs for the webhook URL being called');
    console.log('   OR run: npm run debug-webhook');

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateWebhookIssue();
