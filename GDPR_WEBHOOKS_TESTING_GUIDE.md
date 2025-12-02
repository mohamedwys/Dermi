# GDPR Webhooks Testing Guide

## Overview

This guide helps you test the three mandatory GDPR webhooks required for Shopify App Store submission:

1. **customers/data_request** - Export customer data
2. **customers/redact** - Delete customer data
3. **shop/redact** - Delete all shop data (48 hours after uninstall)

## Implementation Status

✅ All three GDPR webhooks have been implemented:
- `/app/routes/webhooks.customers.data_request.tsx`
- `/app/routes/webhooks.customers.redact.tsx`
- `/app/routes/webhooks.shop.redact.tsx`
- `/app/routes/webhooks.app.uninstalled.tsx` (updated for complete cleanup)

## Testing Methods

### Method 1: Using Shopify CLI (Recommended)

The Shopify CLI provides a `webhook trigger` command to simulate webhook deliveries.

#### Step 1: Start Your Development Server

```bash
npm run dev
```

#### Step 2: Test Customer Data Request Webhook

```bash
shopify app webhook trigger \
  --topic customers/data_request \
  --api-version 2025-01
```

**Expected Response:**
- Status: 200 OK
- JSON response with customer data collected from all tables
- Console logs showing data collection process

**What to verify:**
- Check console for: "📊 Collecting data for customer..."
- Verify response includes: profiles, chat_sessions, chat_messages, analytics
- Confirm all customer data is properly formatted as JSON

#### Step 3: Test Customer Data Redaction Webhook

```bash
shopify app webhook trigger \
  --topic customers/redact \
  --api-version 2025-01
```

**Expected Response:**
- Status: 200 OK
- JSON response confirming deletion
- Console logs showing deletion process

**What to verify:**
- Check console for: "🗑️ Deleting all data for customer..."
- Verify database records are deleted:
  ```sql
  SELECT COUNT(*) FROM UserProfile WHERE customerId = '[test_customer_id]';
  -- Should return 0
  ```
- Check deletion summary in response

#### Step 4: Test Shop Data Redaction Webhook

```bash
shopify app webhook trigger \
  --topic shop/redact \
  --api-version 2025-01
```

**Expected Response:**
- Status: 200 OK
- JSON response with deletion summary
- Console logs showing complete shop cleanup

**What to verify:**
- Check console for: "🗑️ Deleting ALL shop data for..."
- Verify ALL tables are cleaned:
  ```sql
  SELECT COUNT(*) FROM Session WHERE shop = '[test_shop]';
  SELECT COUNT(*) FROM WidgetSettings WHERE shop = '[test_shop]';
  SELECT COUNT(*) FROM ProductEmbedding WHERE shop = '[test_shop]';
  SELECT COUNT(*) FROM UserProfile WHERE shop = '[test_shop]';
  SELECT COUNT(*) FROM ChatSession WHERE shop = '[test_shop]';
  SELECT COUNT(*) FROM ChatMessage; -- Should have no orphaned messages
  SELECT COUNT(*) FROM ChatAnalytics WHERE shop = '[test_shop]';
  -- All should return 0
  ```

#### Step 5: Test App Uninstalled Webhook

```bash
shopify app webhook trigger \
  --topic app/uninstalled \
  --api-version 2025-01
```

**Expected Response:**
- Status: 200 OK
- JSON response with deletion summary
- Console logs showing immediate cleanup

**What to verify:**
- Same as shop/redact verification
- This should run BEFORE shop/redact (which comes 48 hours later)

---

### Method 2: Manual Testing with cURL

If Shopify CLI is not available, you can manually trigger webhooks:

#### Prerequisites

1. Get your app's webhook secret from Partner Dashboard
2. Calculate HMAC signature for webhook authentication
3. Have ngrok or similar tunnel running

#### Example: Test customers/data_request

```bash
# Replace with your values
APP_URL="https://your-app-url.com"
SHOP_DOMAIN="test-store.myshopify.com"
WEBHOOK_SECRET="your_webhook_secret"

# Sample payload
PAYLOAD='{
  "customer": {
    "id": 12345678901234,
    "email": "customer@example.com",
    "phone": "+1234567890"
  },
  "shop_domain": "'$SHOP_DOMAIN'"
}'

# Calculate HMAC (requires openssl)
HMAC=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -binary | base64)

# Send webhook
curl -X POST "$APP_URL/webhooks/customers/data_request" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: customers/data_request" \
  -H "X-Shopify-Hmac-Sha256: $HMAC" \
  -H "X-Shopify-Shop-Domain: $SHOP_DOMAIN" \
  -H "X-Shopify-API-Version: 2025-01" \
  -d "$PAYLOAD"
```

Repeat for other webhooks by changing the topic and URL.

---

### Method 3: Database Verification

After running tests, verify data cleanup manually:

```sql
-- Connect to your database
psql $DATABASE_URL

-- Check for orphaned data for a specific shop
SELECT
  (SELECT COUNT(*) FROM "Session" WHERE shop = 'test-store.myshopify.com') as sessions,
  (SELECT COUNT(*) FROM "WidgetSettings" WHERE shop = 'test-store.myshopify.com') as widget_settings,
  (SELECT COUNT(*) FROM "ProductEmbedding" WHERE shop = 'test-store.myshopify.com') as embeddings,
  (SELECT COUNT(*) FROM "UserProfile" WHERE shop = 'test-store.myshopify.com') as profiles,
  (SELECT COUNT(*) FROM "ChatSession" WHERE shop = 'test-store.myshopify.com') as sessions,
  (SELECT COUNT(*) FROM "ChatAnalytics" WHERE shop = 'test-store.myshopify.com') as analytics;

-- Check for orphaned messages (should be 0 after cleanup)
SELECT COUNT(*)
FROM "ChatMessage" cm
LEFT JOIN "ChatSession" cs ON cm."sessionId" = cs.id
WHERE cs.id IS NULL;
```

---

## Pre-Production Checklist

Before submitting to Shopify App Store, ensure:

- [ ] All three GDPR webhooks return 200 status
- [ ] Customer data request returns complete data in JSON format
- [ ] Customer redaction deletes all customer records
- [ ] Shop redaction deletes ALL shop data from all tables
- [ ] No orphaned records remain after deletion
- [ ] Webhook handlers are idempotent (safe to run multiple times)
- [ ] Error handling returns 200 status to prevent retries
- [ ] Console logging is comprehensive for debugging
- [ ] Database transactions ensure data integrity

---

## Common Issues & Troubleshooting

### Issue: Webhook returns 401 Unauthorized

**Cause:** HMAC validation failed

**Solution:**
- Verify `SHOPIFY_API_SECRET` is correct
- Check webhook secret in Partner Dashboard
- Ensure Shopify CLI is using correct app configuration

### Issue: Webhook returns 500 Internal Server Error

**Cause:** Database constraint violation

**Solution:**
- Check console logs for detailed error
- Verify Prisma schema foreign key constraints
- Ensure deletion order: messages → sessions → profiles
- Use database transaction for atomic operations

### Issue: Data not fully deleted

**Cause:** Missing cascade delete or transaction rollback

**Solution:**
- Verify all related tables are included in deletion
- Check Prisma schema for `onDelete: Cascade`
- Ensure transaction completes without errors
- Manually query database to find orphaned records

### Issue: Webhook times out

**Cause:** Too much data to delete in one request

**Solution:**
- Add batch processing for large deletions
- Increase timeout in webhook handler
- Consider async job queue for large shops

---

## App Store Submission Requirements

When submitting to Shopify App Store, you'll need to provide:

1. **Webhook URLs:**
   - `https://your-app-url.com/webhooks/customers/data_request`
   - `https://your-app-url.com/webhooks/customers/redact`
   - `https://your-app-url.com/webhooks/shop/redact`

2. **Privacy Policy URL:**
   - Already implemented: `https://your-app-url.com/privacy-policy`

3. **GDPR Compliance Statement:**
   - Confirm in Partner Dashboard that your app:
     - Exports customer data within 30 days
     - Deletes customer data within 30 days
     - Deletes shop data within 48 hours after uninstall

---

## Additional Resources

- [Shopify GDPR Compliance Guide](https://shopify.dev/docs/apps/build/privacy-law-compliance)
- [Webhook Authentication](https://shopify.dev/docs/apps/build/webhooks/subscribe/https#step-5-verify-the-webhook)
- [App Store Review Guidelines](https://shopify.dev/docs/apps/launch/app-store-review-guidelines)
- [Prisma Transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions)

---

## Next Steps

After testing GDPR webhooks:

1. ✅ Test all webhooks locally
2. ✅ Deploy to production
3. ✅ Test webhooks in production environment
4. ✅ Document webhook URLs in Partner Dashboard
5. ✅ Update privacy policy with data retention details
6. ✅ Submit app for review

---

**Last Updated:** December 2, 2025
**Status:** ✅ Ready for Testing
