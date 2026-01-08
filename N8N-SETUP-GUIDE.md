# N8N BYOK Workflow Setup Guide

## What Was Happening

The chatbot was crashing with this error:
```
Cannot read properties of undefined (reading 'substring')
```

**Root Cause:** Your N8N workflow was returning an empty response (missing the `message` field) because the SET nodes weren't configured with data assignments.

## What Was Fixed

✅ **N8N Service** (`app/services/n8n.service.server.ts`)
- Now throws an error when N8N response is missing the `message` field
- This triggers automatic fallback to localized messages
- Chatbot continues working even if N8N workflow not configured

✅ **API Route** (`app/routes/api.widget-settings.tsx`)
- Added safety checks before calling `.substring()` on messages
- Prevents crashes from undefined values
- Better error resilience

## Current Status

**The chatbot now works** even without a properly configured N8N workflow! It will automatically fall back to localized "no products found" messages in 6 languages.

However, for the **best user experience**, you should import the complete N8N workflow.

## How to Complete N8N Setup

### Step 1: Import the Complete Workflow

1. **Download the workflow file** from your repository:
   - File: `n8n-byok-complete-workflow.json`
   - This is a complete, production-ready workflow with all nodes properly configured

2. **In your N8N instance:**
   - Go to **Workflows**
   - Click **"Import from File"** or **"Create New"** → **"Import from File"**
   - Upload `n8n-byok-complete-workflow.json`
   - The workflow will be imported with all 9 nodes properly linked

3. **Configure Environment Variables in N8N:**
   - Go to **Workflow Settings** → **Variables** (if using N8N cloud)
   - Or set these in your N8N environment:
   ```bash
   APP_URL=https://your-shopify-app-domain.com
   INTERNAL_API_KEY=your_64_character_hex_key_from_vercel
   ```

4. **Activate the Workflow:**
   - Click **"Activate"** in the top right
   - Copy the **Webhook URL** (should look like: `https://your-n8n.app.n8n.cloud/webhook/byok-chatbot`)

### Step 2: Update Environment Variable in Vercel

```bash
# Set the N8N BYOK webhook URL
vercel env add N8N_WEBHOOK_BYOK production
# Paste the webhook URL you copied from N8N
```

Or in Vercel Dashboard:
- Go to your project → **Settings** → **Environment Variables**
- Add: `N8N_WEBHOOK_BYOK` = `https://your-n8n.app.n8n.cloud/webhook/byok-chatbot`
- Redeploy your app

### Step 3: Test the BYOK Plan

1. Go to your Shopify admin settings
2. Select **"BYOK (Bring Your Own Key)"** plan
3. Enter your OpenAI API key (starts with `sk-` or `sk-proj-`)
4. **Save settings**
5. Test the chatbot with a product search in French: "bonjour vous avez des chaussures noir"

## What the Complete Workflow Does

The imported workflow includes these 9 nodes, all properly configured:

1. **Webhook** - Receives chat requests from your app
2. **Get Shop Settings** - Fetches shop settings including the OpenAI API key
3. **Prepare Data** - Extracts and formats all request data (11 assignments)
4. **Check API Key Exists** - Validates the OpenAI key is present
5. **OpenAI Chat** - Calls OpenAI API with the customer's key
6. **Format Success Response** - Returns proper response format (11 assignments)
7. **Format Error Response** - Handles errors with localized messages (10 assignments)
8. **Respond to Webhook** - Returns JSON response to app
9. **Log Conversation** - Logs conversation to your database

## Expected Response Format

The workflow returns this format (required by your app):

```json
{
  "message": "Je suis désolé, nous n'avons pas de chaussures noires en stock...",
  "messageType": "no_products_found",
  "recommendations": [],
  "quickReplies": ["Voir les meilleures ventes", "Nouveautés", "Tous les produits"],
  "confidence": 0.85,
  "sentiment": "neutral",
  "success": true,
  "analytics": {
    "intentDetected": "product_search",
    "productsShown": 0
  }
}
```

## Troubleshooting

### Issue: Still getting fallback messages

**Check:**
1. Is the N8N workflow **activated**?
2. Is `N8N_WEBHOOK_BYOK` set in Vercel and pointing to the correct webhook URL?
3. Did you redeploy after setting the environment variable?

### Issue: N8N workflow returns empty response

**Check:**
1. Are environment variables set in N8N? (`APP_URL`, `INTERNAL_API_KEY`)
2. Does your `INTERNAL_API_KEY` match between N8N and Vercel?
3. Is the OpenAI API key valid and has credits?

### Issue: 401/403 errors when calling shop settings API

**Check:**
1. `INTERNAL_API_KEY` must be exactly 64 characters (hex)
2. Generate it with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. Must match between Vercel and N8N

## Testing Checklist

- [ ] N8N workflow imported and activated
- [ ] Environment variables set in N8N (`APP_URL`, `INTERNAL_API_KEY`)
- [ ] `N8N_WEBHOOK_BYOK` set in Vercel
- [ ] App redeployed with new environment variable
- [ ] BYOK plan selected in Shopify admin
- [ ] Valid OpenAI API key entered and saved
- [ ] Test message: "bonjour vous avez des chaussures noir"
- [ ] Response received without errors
- [ ] Check N8N execution logs for successful run
- [ ] Check Vercel logs - should see: "🔑 Decrypted OpenAI API key for BYOK plan"

## Current Behavior (Without N8N Workflow)

Your chatbot is currently working with fallback messages:

**French:**
> Je suis désolé, nous n'avons pas de produits correspondant à votre recherche pour le moment. Puis-je vous aider à trouver autre chose ?

**English:**
> I'm sorry, we don't have any products matching your search at the moment. Can I help you find something else?

This is functional, but importing the complete N8N workflow will provide:
- Better AI-generated responses using OpenAI
- More natural conversation flow
- Personalized recommendations
- Context-aware responses

## Need Help?

If you encounter issues after following this guide:
1. Check Vercel logs for errors
2. Check N8N execution logs
3. Verify all environment variables are set correctly
4. Ensure OpenAI API key is valid and has credits
