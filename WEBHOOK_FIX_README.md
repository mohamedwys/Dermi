# 🔧 Quick Fix: Webhook URL Issue

## Problem
Your chatbot is calling the **OLD n8n webhook URL** even though you changed it in n8n.

## Root Cause
The webhook URL can come from **3 sources** (in priority order):

1. **Database** (`WidgetSettings.webhookUrl` field) ← Most likely culprit!
2. **Environment variable** `N8N_WEBHOOK_BYOK` (for BYOK plan)
3. **Environment variable** `N8N_WEBHOOK_URL` (default)

## Quick Diagnosis (Choose One)

### Option A: Run Investigation Script Locally
```bash
npm run investigate-webhook
```
This will show you exactly which webhook URLs are stored in the database and environment.

### Option B: Use Debug API Endpoint
```bash
curl "https://your-vercel-app-url.com/api/debug-webhook?shop=your-store.myshopify.com"
```
Replace with your actual Vercel URL and shop domain.

### Option C: Check Database Directly
```bash
# Connect to your database and run:
SELECT shop, "webhookUrl", plan, "workflowType" FROM "WidgetSettings";
```

## Most Likely Fix

Based on the codebase, the **most common issue** is stale webhooks in the database. Run this command:

```bash
npm run fix-webhook-url
```

This will:
- Show all shops with custom webhook URLs in the database
- Clear them so the app uses environment variables instead
- No need to redeploy after this!

## If That Doesn't Work

### Step 1: Update Vercel Environment Variables

Make sure your Vercel environment variable is updated:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `N8N_WEBHOOK_URL`
3. Update it to your NEW webhook URL
4. **Important**: Click "Redeploy" after updating

### Step 2: Force a Redeploy

Environment variables are loaded at startup, so you MUST redeploy:

```bash
git commit --allow-empty -m "Force redeploy for new webhook URL"
git push
```

## Verification

After the fix, send a test message through the chatbot and check:

1. **Vercel Logs**: Search for "🚀 Calling N8N webhook"
   - Should show your NEW webhook URL

2. **N8N Workflow**: Check if your workflow is receiving requests
   - Go to N8N → Your Workflow → Executions
   - Should see new executions with timestamps

3. **Debug Endpoint**:
   ```bash
   curl "https://your-app.vercel.app/api/debug-webhook?shop=your-store.myshopify.com"
   ```
   Look for `"effectiveWebhookUrl"` in the response.

## What Changed

I added these debugging tools to your codebase:

1. ✅ **Enhanced Logging**: N8N service now logs which webhook URL it's using
2. ✅ **Investigation Script**: `npm run investigate-webhook`
3. ✅ **Debug Script**: `npm run debug-webhook <shop-domain>`
4. ✅ **Fix Script**: `npm run fix-webhook-url`
5. ✅ **Debug API**: `/api/debug-webhook?shop=...`
6. ✅ **Documentation**: `WEBHOOK_ISSUE_INVESTIGATION.md`

## Security Note

The debug API endpoint masks sensitive parts of webhook URLs. For production, you may want to:
- Add authentication to the endpoint
- Or remove it: `rm app/routes/api.debug-webhook.tsx`

## Still Not Working?

If you're still seeing the old webhook URL after:
1. Running `npm run fix-webhook-url`
2. Updating Vercel env vars
3. Redeploying the app

Then check:
- Multiple n8n workflows might be active (old and new)
- CDN/browser cache of the widget bundle
- Proxy or middleware intercepting requests

Share the output of `npm run investigate-webhook` for more help!
