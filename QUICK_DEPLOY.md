# ⚡ Quick Deploy to Railway (5 Minutes)

The fastest way to get ShopiBot into production.

---

## 🎯 Prerequisites

- [ ] Code pushed to GitHub
- [ ] Shopify API Key from Partner Dashboard
- [ ] OpenAI API Key from platform.openai.com

---

## 🚀 Deploy Steps

### **1. Sign Up for Railway**
Go to [railway.app](https://railway.app) and click "Login with GitHub"

### **2. Create New Project**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `shopibot-` repository
4. Click "Deploy Now"

⏱️ Railway starts building... (2-3 minutes)

### **3. Add Database**
1. Click "New" in your project
2. Select "Database" → "PostgreSQL"
3. Click "Add"

✅ Railway automatically connects it!

### **4. Add Environment Variables**

Click "Variables" tab and add:

```env
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_SALES_ASSISTANT_WIDGET_ID=generate_at_uuidgenerator_net
OPENAI_API_KEY=sk-your-openai-api-key-here
NODE_ENV=production
```

Optional (N8N):
```env
N8N_WEBHOOK_URL=your_n8n_webhook_url
N8N_API_KEY=your_n8n_api_key
```

### **5. Update Prisma for PostgreSQL**

In `prisma/schema.prisma`, change line 11:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

Commit and push:
```bash
git add prisma/schema.prisma
git commit -m "Use PostgreSQL for production"
git push
```

Railway auto-deploys! ⚡

### **6. Get Your Production URL**

1. Go to "Settings" tab
2. Scroll to "Domains"
3. Click "Generate Domain"
4. Copy your URL: `https://your-app.up.railway.app`

### **7. Configure Shopify Partner Dashboard**

Go to [partners.shopify.com](https://partners.shopify.com) → Apps → Your App → App setup

**Update these fields:**

**App URL:**
```
https://your-app.up.railway.app
```

**Allowed redirection URLs (add all three):**
```
https://your-app.up.railway.app/auth/callback
https://your-app.up.railway.app/auth/shopify/callback
https://your-app.up.railway.app/api/auth/callback
```

**App Proxy:**
- Subpath prefix: `apps`
- Subpath: `widget-settings`
- Proxy URL: `https://your-app.up.railway.app/api/widget-settings`

Click "Save"

### **8. Test Your Deployment**

1. Install app in your Shopify store
2. Go to app settings page
3. Enable the widget
4. Test chat on your storefront
5. Check analytics dashboard

---

## ✅ Done!

Your ShopiBot is now live in production! 🎉

**What you get:**
- ✅ Stable URL (no more proxy URL issues!)
- ✅ Automatic SSL certificate
- ✅ PostgreSQL database
- ✅ Auto-deploy from GitHub
- ✅ Free $5/month Railway credit
- ✅ Professional hosting

---

## 🔧 Optional: Generate Embeddings

For better AI search, generate embeddings:

```bash
# Locally, pointing to production
DATABASE_URL="your_railway_database_url" npm run generate-embeddings -- --shop=your-store.myshopify.com
```

Or wait for automatic generation during first queries.

---

## 📊 Monitor Your App

**View Logs:**
1. Railway Dashboard → Your Project
2. Click "Deployments" tab
3. Click latest deployment
4. View real-time logs

**Check Health:**
```bash
curl https://your-app.up.railway.app/api/widget-settings
```

Should return 200 OK.

---

## 🐛 Troubleshooting

**Build fails?**
- Check logs in Railway dashboard
- Verify all environment variables are set
- Ensure PostgreSQL database is created

**App proxy not working?**
- Verify URL in Shopify Partner Dashboard
- Test endpoint: `curl https://your-app.up.railway.app/api/widget-settings`
- Check Railway logs for errors

**Database errors?**
- Ensure Prisma schema uses PostgreSQL
- Check DATABASE_URL is set (automatic in Railway)
- Run migrations: Railway does this automatically

---

## 💰 Cost

**Railway Pricing:**
- $5 free credit per month
- Usage-based billing after that
- Typical cost: $5-15/month for small stores

---

## 🔄 Future Deployments

Once set up, deploying updates is automatic:

```bash
git add .
git commit -m "Update feature"
git push
```

Railway automatically:
1. Detects push
2. Builds new version
3. Runs migrations
4. Deploys
5. Zero downtime!

---

## 🎯 Next Steps

- [ ] Monitor analytics dashboard
- [ ] Generate product embeddings
- [ ] Test with real customers
- [ ] Set up custom domain (optional)
- [ ] Configure webhooks (optional)

---

## 📚 More Info

- Full guide: [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md)
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Shopify deployment: [shopify.dev/docs/apps/deployment](https://shopify.dev/docs/apps/deployment)

---

**Total Time:** ~5 minutes
**Difficulty:** Easy 🟢
**Result:** Production app with stable URL! 🚀
