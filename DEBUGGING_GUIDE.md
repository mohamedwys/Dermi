# Session Debugging Guide for Galactiva Shop

## Problem
The chatbot cannot fetch products because the shop "galactiva.myshopify.com" has no valid session in the database.

Error from logs:
```
Could not find a session for shop galactiva.myshopify.com when creating unauthenticated admin context
```

## Quick Diagnosis Commands

### Method 1: Run Debug Script Locally (if you have code locally)
```bash
# Install dependencies first
npm install

# Run the debug script
node scripts/check-session.js
```

### Method 2: Run via Vercel CLI
```bash
# Pull environment variables
vercel env pull

# Run debug script
node scripts/check-session.js
```

### Method 3: Direct Database Query (via Prisma Studio)
```bash
# Open Prisma Studio
npx prisma studio

# Then navigate to "session" table and search for:
# shop = "galactiva.myshopify.com"
```

### Method 4: SQL Query (if you have direct database access)
```sql
-- Check if session exists
SELECT
  id,
  shop,
  "isOnline",
  state,
  scope,
  expires,
  CASE
    WHEN "accessToken" IS NULL THEN 'MISSING'
    WHEN LENGTH("accessToken") > 0 THEN 'PRESENT'
    ELSE 'EMPTY'
  END as token_status
FROM "Session"
WHERE shop = 'galactiva.myshopify.com';

-- List all sessions
SELECT
  shop,
  "isOnline",
  expires,
  CASE
    WHEN "accessToken" IS NULL THEN 'MISSING'
    WHEN LENGTH("accessToken") > 0 THEN 'PRESENT'
    ELSE 'EMPTY'
  END as token_status
FROM "Session"
ORDER BY shop;
```

### Method 5: Check via Vercel Dashboard
1. Go to Vercel Dashboard → Your Project
2. Go to Storage → PostgreSQL (or your database)
3. Click "Query" tab
4. Run the SQL queries above

## Understanding the Issue

### What's Happening
The code in `app/routes/api.widget-settings.tsx` tries to create an unauthenticated admin context:

```typescript
const { admin: shopAdmin } = await unauthenticated.admin(shopDomain);
```

This call requires:
1. A valid **offline access token** stored in the database
2. The session must exist in the `Session` table
3. The token must not be expired

### Why It Fails
One of these scenarios:
1. **App Never Installed**: The shop never completed the OAuth flow
2. **App Uninstalled**: The shop removed the app (which deletes the session)
3. **Database Reset**: The database was wiped/migrated without preserving sessions
4. **Wrong Shop Domain**: Using a different domain than what's in the database

## Solution Steps

### Step 1: Verify Current State
Run one of the debugging methods above to confirm:
- Does the session exist?
- Does it have an access token?
- Is it expired?

### Step 2: Fix Based on Diagnosis

#### If NO session exists:
**You need to install/reinstall the app:**

1. Go to your Shopify Partner Dashboard
2. Find your app
3. Click "Test on development store"
4. Select "galactiva.myshopify.com"
5. Complete the OAuth flow
6. This will create a new session with offline access token

#### If session exists but NO access token:
**The OAuth flow didn't complete properly:**

1. Uninstall the app from the shop admin
2. Reinstall following Step 2 above
3. Make sure you approve ALL requested scopes

#### If session is EXPIRED:
**Refresh the session:**

1. Uninstall the app from shop admin
2. Reinstall via Partner Dashboard
3. The new session will have a fresh token

### Step 3: Verify Fix
After reinstalling, run the debug script again:
```bash
node scripts/check-session.js
```

You should see:
```
✅ SESSION FOUND
   Has Access Token: true
   ✅ STATUS: VALID
```

### Step 4: Test Chatbot
1. Open the shop website with the widget
2. Click "Browse products"
3. You should now see products instead of the error message

## Technical Details

### Required OAuth Scopes
Your app needs these scopes (check `shopify.app.toml`):
```toml
scopes = "write_products,read_products,read_customer_events"
```

### Session Storage
Sessions are stored via Prisma in PostgreSQL:
- Table: `Session`
- Required fields: `shop`, `accessToken`, `scope`
- Optional: `expires`, `isOnline`, `state`

### Code Flow
1. User clicks "Browse products" in widget
2. Widget sends request to `/api/widget-settings`
3. Backend tries: `unauthenticated.admin(shopDomain)`
4. Shopify SDK looks up session in database
5. If found → Uses access token to call Shopify API
6. If NOT found → Throws "Could not find a session" error

## Prevention

To avoid this issue in the future:

1. **Never manually delete sessions** from the database
2. **Test OAuth flow** after deployment
3. **Add monitoring** for session errors
4. **Handle session refresh** in your code (future enhancement)

## Still Not Working?

Check these common issues:

### 1. Wrong DATABASE_URL
```bash
# Verify environment variable
echo $DATABASE_URL
```

### 2. Database Connection
```bash
# Test connection
npx prisma db pull
```

### 3. OAuth Configuration
Check `shopify.app.toml`:
```toml
[auth]
redirect_urls = [
  "https://your-domain.vercel.app/auth/callback"
]
```

### 4. Shop Domain Format
Ensure you're using the correct format:
- ✅ Correct: `galactiva.myshopify.com`
- ❌ Wrong: `https://galactiva.myshopify.com`
- ❌ Wrong: `galactiva`

## Contact Support

If none of this works:
1. Export your database schema: `npx prisma db pull`
2. Check Vercel deployment logs
3. Verify environment variables in Vercel dashboard
4. Check Shopify Partner Dashboard for app installation status
