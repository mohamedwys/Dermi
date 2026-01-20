# 🚀 Next Steps: Fix Your Webhook URL Issue

## What I Found

Your chatbot webhook URL can come from **3 sources** (priority order):

1. **Database** - `WidgetSettings.webhookUrl` (per shop) ← **HIGHEST PRIORITY**
2. **Env Var** - `N8N_WEBHOOK_BYOK` (for BYOK plan shops)
3. **Env Var** - `N8N_WEBHOOK_URL` (default for all other shops)

**Key Finding**: If any shop has a custom webhook in the database, it OVERRIDES your environment variables!

## 🔧 How to Fix (Choose One)

### Option 1: Quick Fix via API (Recommended)

Once the build succeeds, check which webhook is active:

```bash
curl "https://dermi-shopify-ai-chatbot.vercel.app/api/debug-webhook?shop=YOUR-STORE.myshopify.com"
```

Replace `YOUR-STORE` with your actual Shopify store domain.

**What to look for:**
```json
{
  "resolution": {
    "effectiveWebhookUrl": "https://dermadia.app.n8n.cloud/webhook/****",
    "webhookSource": "DATABASE (custom webhook)" ← This is the problem!
  }
}
```

If you see `"DATABASE (custom webhook)"`, that means the old webhook is stored in your database and overriding your env vars.

### Option 2: Fix via Database Script

If you have local database access:

```bash
# Install dependencies if needed
npm install

# Run the investigation
npm run investigate-webhook

# If it shows stale webhooks, run the fix
npm run fix-webhook-url
```

This will:
- Show all shops with custom webhooks
- Clear them from the database
- Force the app to use your environment variables

### Option 3: Manual Database Update

If you have direct database access (e.g., via Vercel Postgres UI):

```sql
-- Check which shops have custom webhooks
SELECT shop, "webhookUrl", plan, "workflowType"
FROM "WidgetSettings"
WHERE "webhookUrl" IS NOT NULL;

-- Clear all custom webhooks (forces env var usage)
UPDATE "WidgetSettings"
SET "webhookUrl" = NULL, "workflowType" = 'DEFAULT';
```

## 🔍 Verify the Fix

After applying the fix, verify it worked:

### Method 1: Send Test Message
1. Go to your Shopify store
2. Open the chatbot widget
3. Send a test message
4. Check Vercel logs for: `🚀 Calling N8N webhook`
5. Verify the URL matches your NEW webhook

### Method 2: Use Debug Endpoint
```bash
curl "https://dermi-shopify-ai-chatbot.vercel.app/api/debug-webhook?shop=YOUR-STORE.myshopify.com"
```

Look for:
```json
{
  "resolution": {
    "effectiveWebhookUrl": "https://dermadia.app.n8n.cloud/webhook/chat",
    "webhookSource": "ENVIRONMENT VARIABLE (N8N_WEBHOOK_URL)" ← SUCCESS!
  }
}
```

### Method 3: Check N8N Executions
1. Go to N8N dashboard
2. Open your NEW workflow
3. Check "Executions" tab
4. You should see new executions coming in

## 📋 Files Changed

I added these debugging tools:

- ✅ `app/routes/api.debug-webhook.tsx` - Debug API endpoint
- ✅ `scripts/investigate-webhook-issue.ts` - Investigation script
- ✅ `scripts/debug-webhook-live.ts` - Real-time debug script
- ✅ Enhanced logging in `app/services/n8n.service.server.ts`
- ✅ Documentation: `WEBHOOK_FIX_README.md` & `WEBHOOK_ISSUE_INVESTIGATION.md`

## 🎯 Expected Result

After the fix:
- ✅ All messages route to: `https://dermadia.app.n8n.cloud/webhook/chat`
- ✅ Vercel logs show correct webhook URL
- ✅ N8N workflow receives and processes messages
- ✅ Chatbot responds with AI answers (not fallback)

## ⚠️ Important Notes

1. **No redeploy needed** if fixing via database
2. **Redeploy required** if changing Vercel env vars
3. **Check ALL shops** - each shop can have different settings
4. **Environment variable priority**: Database webhooks ALWAYS win

## 🆘 Still Not Working?

If the issue persists:

1. Check if you have **multiple n8n workflows** active (old + new)
2. Verify your NEW webhook URL is actually: `https://dermadia.app.n8n.cloud/webhook/chat`
3. Check Vercel environment variables: `N8N_WEBHOOK_URL`
4. Look for browser/CDN caching issues
5. Share the output of the debug endpoint for more help

## 📞 Debug Output Format

When sharing debug info, provide:
```bash
# Show effective webhook URL
curl "https://dermi-shopify-ai-chatbot.vercel.app/api/debug-webhook?shop=YOUR-STORE.myshopify.com"

# Or run locally
npm run investigate-webhook
```

This will tell me exactly what's happening and where the old URL is coming from!
