# Database Migration Guide

## Problem

The dashboard is empty because Prisma migrations haven't been applied to the production database. You're seeing these errors:

```
The column `workflowUsage` does not exist in the current database.
The column `WidgetSettings.workflowType` does not exist in the current database.
```

## Solution

The migrations already exist in your codebase. You just need to apply them to your production database.

### Migrations to Apply

1. **`20251216190500_add_workflow_usage_tracking`** - Adds `workflowUsage` column to `ChatAnalytics`
2. **`20251220_add_workflow_type`** - Adds `workflowType` column and enum to `WidgetSettings`

---

## Option 1: Deploy via Vercel Build (Recommended)

### Step 1: Verify Build Script

Your `package.json` already includes migration in the build script:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && remix vite:build"
  }
}
```

### Step 2: Trigger Vercel Redeploy

1. Go to your Vercel dashboard
2. Click "Deployments"
3. Click "Redeploy" on the latest deployment
4. Check deployment logs for migration success

---

## Verification Steps

After applying migrations:

1. Check Vercel logs for Prisma errors (should be gone)
2. Test dashboard - should show analytics data
3. Send test messages - verify they're saved to database

---

## Quick Check

Run locally to see migration status:

```bash
npx prisma migrate status
```

Expected: "Database schema is up to date!"
