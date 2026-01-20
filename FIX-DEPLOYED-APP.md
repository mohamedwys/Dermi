# 🔧 FIX: Admin Pages Not Loading (Deployed App)

## 🎯 ROOT CAUSE IDENTIFIED

You added `SKIP_BILLING_CHECK=true` to your **local `.env` file**, but you're accessing the app deployed on **Vercel** which doesn't have this environment variable set.

**Result:** The deployed app still requires billing subscription, causing blank white screen.

---

## ✅ SOLUTION: Add Environment Variable to Vercel

### Step 1: Access Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Log in to your account
3. Find your project (likely named "Dermi" or "Shopibot")
4. Click on the project

### Step 2: Add Environment Variable

1. Click **Settings** tab (top menu)
2. Click **Environment Variables** (left sidebar)
3. Add new variable:
   - **Name**: `SKIP_BILLING_CHECK`
   - **Value**: `true`
   - **Environment**: Select ALL (Production, Preview, Development)
4. Click **Save**

### Step 3: Redeploy

**Option A: Automatic Redeploy**
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots** menu (•••)
4. Click **Redeploy**
5. Confirm the redeploy

**Option B: Trigger New Deployment**
```bash
# Push a small change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy with SKIP_BILLING_CHECK"
git push origin main
```

### Step 4: Wait for Deployment

- Vercel will rebuild your app (~2-3 minutes)
- Watch the deployment progress in Vercel dashboard
- Wait for "Ready" status

### Step 5: Test Admin Pages

1. Open Shopify Admin
2. Go to Apps → Your App (Dermi)
3. Dashboard should now load ✅
4. Try Settings page ✅
5. Try Analytics page ✅

---

## 🖼️ VISUAL GUIDE: Adding Environment Variable in Vercel

```
Vercel Dashboard
└── Your Project
    └── Settings
        └── Environment Variables
            ├── Name: SKIP_BILLING_CHECK
            ├── Value: true
            └── Environments: ☑ Production ☑ Preview ☑ Development
            └── [Save] button
```

---

## 🔍 ALTERNATIVE: If Using Railway or Render

### Railway:

1. Go to [railway.app](https://railway.app)
2. Select your project
3. Click **Variables** tab
4. Click **+ New Variable**
5. Add: `SKIP_BILLING_CHECK=true`
6. Click **Deploy** (triggers automatic redeploy)

### Render:

1. Go to [render.com](https://render.com)
2. Select your web service
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Key: `SKIP_BILLING_CHECK`
6. Value: `true`
7. Click **Save Changes**
8. Render will automatically redeploy

---

## 🐛 TROUBLESHOOTING

### Issue: Variable added but pages still blank

**Check 1: Did deployment finish?**
- Go to Vercel Deployments tab
- Ensure latest deployment shows "Ready" status
- Should see green checkmark

**Check 2: Is variable actually set?**
- In Vercel, go to Settings → Environment Variables
- Verify `SKIP_BILLING_CHECK` is listed
- Verify it's enabled for "Production" environment

**Check 3: Clear browser cache**
```bash
# In browser:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"
```

**Check 4: Check deployment logs**
- Go to Vercel Deployments tab
- Click on latest deployment
- Check build logs for errors
- Look for "SKIP_BILLING_CHECK" in logs

### Issue: Build failed after adding variable

**Cause:** Unlikely, but if build fails:

**Check build logs:**
1. Vercel → Deployments → Latest deployment
2. Click "Building" or "Error" status
3. Read error message

**Common issues:**
- Prisma migration failed → Check DATABASE_URL is set
- Dependencies error → May need to clear build cache
- TypeScript error → Check code compiles locally first

---

## 📋 ENVIRONMENT VARIABLES CHECKLIST

Verify ALL these variables are set in Vercel:

### Required (App won't work without these):
- [ ] `SHOPIFY_API_KEY` - From Partner Dashboard → Client ID
- [ ] `SHOPIFY_API_SECRET` - From Partner Dashboard → Client secret
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `ENCRYPTION_KEY` - 64-character hex string

### Recommended:
- [ ] `SKIP_BILLING_CHECK=true` - Bypass billing requirement (development)
- [ ] `NODE_ENV=production` - Set environment mode
- [ ] `SHOPIFY_APP_URL` - Your Vercel URL

### Optional:
- [ ] `N8N_WEBHOOK_URL` - N8N workflow URL
- [ ] `N8N_API_KEY` - N8N API key
- [ ] `OPENAI_API_KEY` - OpenAI API key (for default workflow)
- [ ] `SENTRY_DSN` - Sentry error tracking
- [ ] `INTERNAL_API_KEY` - For API authentication

---

## 🎯 EXPECTED RESULT AFTER FIX

### Before:
```
Open app in Shopify Admin → Blank white screen ❌
```

### After:
```
Open app in Shopify Admin → Dashboard loads with:
├── Performance Overview (metrics)
├── System Status (components status)
├── Top Questions (analytics)
├── Setup Progress (completion status)
└── Quick Actions (buttons)
✅ SUCCESS
```

---

## 🚀 FOR PRODUCTION (Remove SKIP_BILLING_CHECK)

Once testing is complete and you want to require subscriptions:

### Step 1: Remove from Vercel
1. Vercel → Settings → Environment Variables
2. Find `SKIP_BILLING_CHECK`
3. Click **Delete** (trash icon)
4. Confirm deletion

### Step 2: Redeploy
- Push any change to trigger redeploy
- OR use Vercel's redeploy button

### Step 3: Test Billing Flow
1. Uninstall app from test store
2. Reinstall app
3. Should redirect to onboarding/billing page
4. Select a plan (test mode)
5. Approve subscription
6. Dashboard should now load

---

## 💡 IMPORTANT NOTES

### About Test Mode:
- In development, billing is in **test mode**
- No real charges occur
- Can approve subscriptions without payment
- Perfect for testing billing flow

### About Production:
- When you publish to App Store or use on production stores
- Set `NODE_ENV=production` in Vercel
- Remove `SKIP_BILLING_CHECK`
- Real subscriptions will be created

### About the Blank Screen:
- Not a bug in your code ✅
- Not a database issue ✅
- Not an App Bridge issue ✅
- **Simply missing environment variable** 🎯

---

## 📞 NEXT STEPS

1. **Add `SKIP_BILLING_CHECK=true` to Vercel environment variables**
2. **Redeploy the app**
3. **Wait 2-3 minutes for deployment to complete**
4. **Refresh your Shopify Admin app page**
5. **Dashboard should now load!**

If it still doesn't work after this, please share:
- Screenshot of your Vercel environment variables page
- Screenshot of the blank screen
- Any new console errors (F12 → Console tab)

---

**Generated:** 2026-01-20
**Issue:** Admin pages showing blank white screen
**Cause:** Missing `SKIP_BILLING_CHECK` environment variable on Vercel
**Fix:** Add environment variable and redeploy
**Time to fix:** ~5 minutes
