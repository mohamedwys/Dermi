# Database Schema Verification Guide

## ✅ Schema Status: CORRECT

Your Prisma schema is properly set up with all necessary tables and relationships.

---

## 📊 Database Schema Overview

### Tables (9 total)

1. **Session** - Shopify app sessions
   - Stores OAuth tokens and user info
   - Used by Shopify SDK

2. **WidgetSettings** - Widget configuration
   - Shop-specific settings
   - Unique constraint: `shop`

3. **ProductEmbedding** - Vector embeddings for products
   - For semantic search
   - Unique constraint: `shop + productId`

4. **UserProfile** - Customer profiles
   - Tracks browsing/purchase history
   - Unique constraint: `shop + sessionId`

5. **ChatSession** - Chat conversations
   - Links to UserProfile
   - Tracks ratings

6. **ChatMessage** - Individual messages
   - Links to ChatSession
   - Stores intent, sentiment, confidence

7. **ChatAnalytics** - Daily aggregated analytics
   - **THIS IS THE KEY TABLE FOR DASHBOARD**
   - Unique constraint: `shop + date`
   - Stores daily metrics

8. **Conversation** - Conversation history
   - Legacy table for compatibility

9. **ByokUsage** - BYOK plan usage tracking
   - Tracks token usage
   - Unique constraint: `shop + date`

---

## 🔑 Critical Relationships

### For Dashboard Data Flow:

```
Widget Interaction
  ↓
ChatMessage created (linked to ChatSession)
  ↓
ChatSession created (linked to UserProfile)
  ↓
UserProfile created (shop + sessionId unique)
  ↓
ChatAnalytics updated (daily aggregates)
  ↓
Dashboard queries ChatAnalytics table
```

---

## 🔍 Migration Status

### Current Migrations:

1. **20260120064540_init** - Initial migration
   - Creates all 9 tables
   - Adds all indexes
   - Adds foreign key constraints
   - Status: ✅ Complete

### Migration is Correct:

- ✅ All tables defined
- ✅ Indexes created (for performance)
- ✅ Foreign keys set up
- ✅ Unique constraints in place
- ✅ Enum types created (WorkflowType)

---

## ⚠️ Common Issues

### Issue 1: Migration Not Run on Vercel

**Symptoms:**
- Dashboard shows 0
- Debug logs show "table does not exist" errors

**Solution:**
```bash
# On Vercel, run in build command:
npx prisma generate
npx prisma migrate deploy
```

**Check:** Use "Verify Database" button in dashboard

### Issue 2: Empty Database (Current Issue)

**Symptoms:**
- Tables exist
- All counts are 0
- No errors in logs

**This is YOUR current situation!**

**Solution:**
1. Click "Verify Database" → Confirms tables exist
2. Click "Generate Test Data" → Populates with sample data
3. Install widget → Gets real data flowing

---

## 🎯 How to Verify Schema

### Option 1: Dashboard Button (Easiest)

1. Go to dashboard
2. See "No Data Found" banner
3. Click "Verify Database"
4. Results show:
   - ✅ All tables exist
   - ✅ Constraints working
   - ⚠️ But no data for your shop

### Option 2: Run Script Locally

```bash
npx ts-node scripts/verify-database.ts
```

### Option 3: Check Vercel Logs

Look for successful migrations:
```
Running migrations...
Applying migration 20260120064540_init
Migration applied successfully
```

### Option 4: Direct Database Query

```sql
-- Check if ChatAnalytics table exists
SELECT COUNT(*) FROM "ChatAnalytics";

-- Check for your shop
SELECT COUNT(*) FROM "ChatAnalytics"
WHERE shop = 'galactiva.myshopify.com';
```

---

## 📋 Verification Checklist

- [ ] Migration file exists: `prisma/migrations/20260120064540_init/`
- [ ] Migration was run on Vercel (check build logs)
- [ ] All 9 tables are accessible (use Verify Database button)
- [ ] Foreign key relationships work
- [ ] Unique constraints are enforced
- [ ] No "table does not exist" errors in logs

---

## 🐛 Troubleshooting

### Tables Don't Exist

```bash
# Run migrations
npx prisma migrate deploy

# Or reset database (careful - deletes data!)
npx prisma migrate reset
```

### Schema Drift Detected

```bash
# Generate new migration
npx prisma migrate dev --name fix_schema_drift

# Deploy to production
npx prisma migrate deploy
```

### Connection Issues

Check `DATABASE_URL` has proper pooling:
```
?pgbouncer=true&connection_limit=1
```

---

## ✅ Your Situation

Based on debug logs:

1. **Schema:** ✅ Correct
2. **Migration:** ✅ Exists and is complete
3. **Tables:** ✅ Accessible (no errors)
4. **Data:** ❌ Empty (all counts = 0)

**Conclusion:** Your database schema is PERFECT. The issue is simply that no data has been created yet.

**Solution:** Generate test data or use the widget to create real data.

---

## 📊 Expected Record Counts

### After Fresh Install:
- Session: 1+ (from your Shopify login)
- WidgetSettings: 1 (created on first settings save)
- Everything else: 0 (until widget is used)

### After Using Widget:
- ChatAnalytics: 1 per day of activity
- ChatSession: 1 per customer conversation
- ChatMessage: 2+ per conversation (user + assistant)
- UserProfile: 1 per unique session

### After Test Data Generation:
- ChatAnalytics: 30 records (30 days)
- ChatSession: 1
- ChatMessage: 4
- UserProfile: 1

---

## 🚀 Next Steps

Since your schema is correct:

1. ✅ **Verify:** Click "Verify Database" button
   - Confirms all tables exist
   - Shows 0 records for your shop

2. ✅ **Generate:** Click "Generate Test Data" button
   - Creates 30 days of sample analytics
   - Dashboard immediately shows data

3. ✅ **Real Usage:** Install and test widget
   - Real customer interactions
   - Real analytics data

---

## 📝 Schema Maintenance

### Adding New Fields:

1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_field_name`
3. Deploy: `npx prisma migrate deploy`

### Viewing Current Schema:

```bash
# Generate Prisma Studio
npx prisma studio

# Opens browser to view/edit data
```

---

## ✅ Summary

**Your database schema is CORRECT and COMPLETE.**

- ✅ All tables properly defined
- ✅ Indexes for performance
- ✅ Foreign keys for data integrity
- ✅ Unique constraints to prevent duplicates
- ✅ Migration applied successfully

**The only issue:** Database is empty (no data yet).

**Simple fix:** Use "Generate Test Data" button!

Your schema is production-ready. Just needs data! 🎉
