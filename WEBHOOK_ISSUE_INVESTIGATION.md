# Webhook URL Investigation & Fix Guide

## 🔍 Root Cause Analysis

Your Shopify chatbot is calling the **OLD webhook URL** because the webhook URL can come from **3 different sources**, and you need to check all of them:

### Webhook URL Priority (in order):

1. **Database (per shop)** - `WidgetSettings.webhookUrl` field
   - If `workflowType = 'CUSTOM'` and `webhookUrl` is set in the database, it **overrides everything**
   - Located in: `prisma/schema.prisma` line 38

2. **Environment Variable (BYOK plan)** - `N8N_WEBHOOK_BYOK`
   - Used when `plan = 'BYOK'` and no custom webhook is set
   - Falls back to `N8N_WEBHOOK_URL` if not set

3. **Environment Variable (default)** - `N8N_WEBHOOK_URL`
   - Used for all other plans (Starter, Pro, etc.)
   - This is the most common source

## 📂 Where the Webhook URL is Used

### 1. **Main API Route**: `app/routes/api.widget-settings.tsx` (lines 890-955)
   - Handles all incoming chat messages
   - Determines which webhook URL to use based on shop settings
   - Creates an N8NService instance with the resolved webhook URL

### 2. **N8N Service**: `app/services/n8n.service.server.ts` (lines 104-129)
   - Constructor accepts `webhookUrl` parameter OR uses `process.env.N8N_WEBHOOK_URL`
   - Makes the actual HTTP POST request to the webhook (line 173)

### 3. **Other Routes**:
   - `app/routes/apps.widget-settings.tsx` (line 291)
   - `app/routes/apps.sales-assistant-api.tsx` (lines 342-358)
   - `app/routes/api.analyze-image.tsx` (line 106)

## 🎯 The Problem

Based on the `scripts/fix-webhook-url.ts` file, your **expected NEW webhook URL** is:
```
https://dermadia.app.n8n.cloud/webhook/chat
```

But the chatbot is still calling an **OLD webhook URL** because:

### Scenario A: Database has stale webhook URLs
- Some shops have custom webhook URLs stored in the database
- These override environment variables
- **Solution**: Clear the database webhooks

### Scenario B: Vercel environment variables are outdated
- `N8N_WEBHOOK_URL` in Vercel still points to the old URL
- The app loads env vars at startup
- **Solution**: Update Vercel env vars and redeploy

### Scenario C: Widget bundle is cached
- If the widget is embedded in storefronts, it might be cached
- **Solution**: Clear CDN/browser cache

## 🛠️ Step-by-Step Fix

### Step 1: Investigate Current State

Run the investigation script locally (if you have DB access):
```bash
npm run investigate-webhook
```

Or check via the debug API endpoint:
```bash
curl "https://your-app-url.com/api/debug-webhook?shop=mystore.myshopify.com"
```

This will show:
- ✅ Environment variables (N8N_WEBHOOK_URL, N8N_WEBHOOK_BYOK)
- ✅ Database webhook URLs per shop
- ✅ Which webhook URL will actually be used

### Step 2: Clear Stale Database Webhooks

If any shops have custom webhooks in the database, clear them:

```bash
npm run fix-webhook-url
```

This script will:
- Show all shops with custom webhook URLs
- Clear all `webhookUrl` fields in the database
- Force all shops to use environment variables instead

### Step 3: Update Vercel Environment Variables

1. **Check current Vercel env vars:**
   ```bash
   vercel env pull .env.local
   cat .env.local | grep N8N_WEBHOOK
   ```

2. **Update the N8N_WEBHOOK_URL:**
   ```bash
   # Remove old value
   vercel env rm N8N_WEBHOOK_URL production

   # Add new value
   vercel env add N8N_WEBHOOK_URL production
   # When prompted, enter: https://dermadia.app.n8n.cloud/webhook/chat
   ```

3. **Optional: Set BYOK webhook (if using BYOK plan):**
   ```bash
   vercel env add N8N_WEBHOOK_BYOK production
   # Enter your BYOK webhook URL
   ```

### Step 4: Redeploy the Application

After updating environment variables, trigger a new deployment:

```bash
# Option 1: Trigger redeploy via Vercel dashboard
# Go to Vercel → Your Project → Deployments → Redeploy latest

# Option 2: Push a commit to trigger deployment
git commit --allow-empty -m "Force redeploy to apply new webhook URL"
git push origin claude/fix-webhook-url-gNaaG
```

**IMPORTANT**: Environment variables are loaded at **build time and startup**, not dynamically. You MUST redeploy for changes to take effect.

### Step 5: Verify the Fix

**Option A: Check Vercel Logs**
1. Send a test message through the chatbot
2. Go to Vercel → Your Project → Logs
3. Search for: "Calling N8N webhook"
4. Verify the webhook URL in the logs matches your new URL

**Option B: Use Debug Endpoint**
```bash
curl "https://your-app-url.com/api/debug-webhook?shop=mystore.myshopify.com"
```

**Option C: Use Debug Script** (if you have DB access locally)
```bash
npm run debug-webhook mystore.myshopify.com
```

## 📊 Code References

### Where webhook URL is determined:
- **File**: `app/routes/api.widget-settings.tsx`
- **Lines**: 890-955
- **Logic**:
  ```typescript
  if (workflowType === 'CUSTOM' && isValidCustomUrl) {
    webhookUrl = customWebhookUrl; // From database
  } else if (plan === 'BYOK') {
    webhookUrl = process.env.N8N_WEBHOOK_BYOK || process.env.N8N_WEBHOOK_URL;
  } else {
    webhookUrl = process.env.N8N_WEBHOOK_URL; // Most common
  }
  ```

### Where webhook is called:
- **File**: `app/services/n8n.service.server.ts`
- **Line**: 173
- **Code**: `await axios.post(this.webhookUrl, request, { ... })`

### Database schema:
- **File**: `prisma/schema.prisma`
- **Line**: 38
- **Field**: `webhookUrl String?`

## 🚨 Common Pitfalls

### 1. **Forgetting to redeploy after env var changes**
   - ❌ Updating Vercel env vars without redeploying
   - ✅ Always redeploy after changing environment variables

### 2. **Database webhooks overriding env vars**
   - ❌ Having custom webhook URLs in the database
   - ✅ Clear database webhooks or set `workflowType = 'DEFAULT'`

### 3. **Not checking all shops**
   - ❌ Only checking one shop's settings
   - ✅ Run `npm run investigate-webhook` to check ALL shops

### 4. **Widget cache issues**
   - ❌ Widget bundle cached in CDN or browser
   - ✅ Hard refresh (Ctrl+Shift+R) or wait for cache expiry

## 🔐 Security Note

The debug endpoint `/api/debug-webhook` masks sensitive parts of webhook URLs. However, for production:

**Option 1: Protect with authentication**
```typescript
// Add authentication check
const internalApiKey = request.headers.get('X-Internal-API-Key');
if (internalApiKey !== process.env.INTERNAL_API_KEY) {
  return json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Option 2: Remove the endpoint**
```bash
rm app/routes/api.debug-webhook.tsx
```

**Option 3: Only enable in development**
```typescript
if (process.env.NODE_ENV === 'production') {
  return json({ error: 'Not available in production' }, { status: 404 });
}
```

## 📝 Permanent Solution

To prevent this issue in the future:

### 1. **Single Source of Truth**
   Choose ONE place for webhook URL:
   - ✅ **Recommended**: Environment variables (N8N_WEBHOOK_URL)
   - ❌ Avoid: Storing in database per shop (unless you need custom webhooks)

### 2. **Webhook URL Validation**
   Add validation in the settings form:
   ```typescript
   // In app/routes/app.settings.tsx
   if (workflowType === 'CUSTOM' && !webhookUrl.startsWith('https://')) {
     return json({ error: 'Webhook URL must start with https://' });
   }
   ```

### 3. **Monitoring & Alerts**
   - Add webhook health checks
   - Alert when webhook calls fail with 404
   - Log which webhook URL is used for each request

### 4. **Documentation**
   - Document the webhook URL priority system
   - Add comments in code explaining the resolution logic
   - Create a webhook configuration guide for merchants

## ✅ Expected Result After Fix

After completing all steps:
1. ✅ All chat messages sent to: `https://dermadia.app.n8n.cloud/webhook/chat`
2. ✅ Vercel logs show: "🚀 Calling N8N webhook" with correct URL
3. ✅ N8N workflow receives and processes messages
4. ✅ Chatbot responds with AI-generated answers (not fallback)

## 🆘 Still Having Issues?

If the webhook is still calling the old URL after following all steps:

1. **Check Vercel deployment logs** for any errors during build
2. **Verify database is accessible** and webhooks are cleared
3. **Check for multiple N8N workflows** - old workflow might still be active
4. **Look for hardcoded URLs** in the codebase (though I didn't find any)
5. **Check for proxy/forwarding** that might be redirecting requests

## 📞 Debug Contact Info

If you need more help, provide:
- Output of `npm run investigate-webhook`
- Output of debug API endpoint
- Vercel deployment logs
- N8N workflow logs showing incoming webhook calls
