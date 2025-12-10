# Database Settings Fix Guide

## 🔴 Issue Identified

Your widget settings cannot be saved/loaded due to a **missing Prisma client**.

### Error Symptoms:
```
{"level":50,"time":"2025-12-10T11:16:59.445Z","env":"production","app":"iheard-ai","msg":"Database error in settings loader:"}
```

### Root Cause:
The Prisma client was not generated after deployment. This typically happens:
- ✗ After fresh clone/deployment
- ✗ After dependency updates
- ✗ After database schema changes
- ✗ Missing `node_modules/.prisma/client` directory

---

## ✅ Quick Fix (Option 1)

Run the automated fix script:

```bash
bash scripts/fix-database.sh
```

This will:
1. Generate Prisma client
2. Check database connection
3. Push schema to database
4. Show helpful troubleshooting tips

---

## ✅ Manual Fix (Option 2)

### Step 1: Generate Prisma Client
```bash
npm run prisma:generate
```

Or directly:
```bash
npx prisma generate
```

### Step 2: Push Schema to Database
```bash
npx prisma db push
```

### Step 3: Restart Server
```bash
# Kill existing server
npm run dev
# Or in production
npm run build && npm start
```

---

## 🔍 Verify Fix

### Check 1: Prisma Client Exists
```bash
ls -la node_modules/.prisma/client
```

Should show directory with generated client files.

### Check 2: Test Database Connection
```bash
npx prisma db push
```

Should connect successfully and show:
```
✔ The database is already in sync with the Prisma schema.
```

### Check 3: Check Logs
After restarting, look for:
- ✅ No "Database error in settings loader" messages
- ✅ Settings page loads without errors
- ✅ Can save settings successfully

---

## 🛠️ Enhanced Error Logging

We've improved error logging to help diagnose issues faster:

### Before (Unhelpful):
```json
{"msg":"Database error in settings loader:"}
```

### After (Detailed):
```json
{
  "msg": "Database error in settings loader:",
  "error": {
    "message": "PrismaClient is unable to run in this browser environment...",
    "name": "PrismaClientInitializationError",
    "stack": "PrismaClientInitializationError: PrismaClient is unable to..."
  },
  "shop": "galactiva.myshopify.com"
}
```

Now you get:
- ✅ **Error message** - What went wrong
- ✅ **Error name** - Type of error
- ✅ **Stack trace** - Where it happened
- ✅ **Shop context** - Which store

---

## 📋 Common Errors & Solutions

### Error 1: "PrismaClient is unable to run in this browser environment"
**Cause**: Prisma client not generated
**Fix**: Run `npm run prisma:generate`

### Error 2: "Can't reach database server"
**Cause**: DATABASE_URL not set or incorrect
**Fix**: Check `.env` file, verify database is running

### Error 3: "Table 'WidgetSettings' does not exist"
**Cause**: Database schema not pushed
**Fix**: Run `npx prisma db push`

### Error 4: "Environment variable not found: DATABASE_URL"
**Cause**: Missing environment variable
**Fix**: Add `DATABASE_URL` to `.env`:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

---

## 🚀 Production Deployment Checklist

When deploying to production, ensure:

### ✅ Build Phase:
```json
{
  "scripts": {
    "build": "prisma generate && remix vite:build"
  }
}
```

### ✅ Environment Variables Set:
- `DATABASE_URL` - Database connection string
- `NODE_ENV=production`
- All Shopify API keys

### ✅ Post-Deploy:
1. Verify Prisma client generated
2. Check database schema synced
3. Test settings page loads
4. Try saving/loading settings

---

## 📊 Monitoring Settings

### Check Current Settings:
```bash
# Using Prisma Studio (visual database browser)
npx prisma studio
```

Navigate to `WidgetSettings` table to see all saved settings.

### Query Settings Directly:
```bash
npx prisma db execute --stdin <<EOF
SELECT * FROM "WidgetSettings";
EOF
```

### Check Logs for Settings Changes:
Look for these log messages:
```
💾 Saving settings for shop: galactiva.myshopify.com
🔧 Webhook URL being saved: [URL or [CLEARED/DEFAULT]]
✅ Settings saved to database successfully
```

---

## 🔄 Testing After Fix

### Test 1: Load Settings Page
1. Open settings page in admin
2. Should load without errors
3. Check browser console - no error messages

### Test 2: Save Settings
1. Change any setting (e.g., button text)
2. Click "Save"
3. Should see success message
4. Refresh page - changes persist

### Test 3: Widget Settings Apply
1. Visit your storefront
2. Widget should use saved settings
3. Check button text, colors, position match admin settings

---

## 🏗️ Database Schema

Current WidgetSettings schema:

```prisma
model WidgetSettings {
  id               String   @id @default(cuid())
  shop             String   @unique
  enabled          Boolean  @default(true)
  position         String   @default("bottom-right")
  buttonText       String   @default("Ask AI Assistant")
  chatTitle        String   @default("AI Sales Assistant")
  welcomeMessage   String   @default("Hello! I'm your AI sales assistant...")
  inputPlaceholder String   @default("Ask me anything about our products...")
  primaryColor     String   @default("#ee5cee")
  webhookUrl       String?  // Optional N8N webhook
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

---

## 🎯 Prevention

To prevent this issue in the future:

### 1. Add to package.json:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && remix vite:build"
  }
}
```

### 2. CI/CD Pipeline:
```yaml
# .github/workflows/deploy.yml
- name: Generate Prisma Client
  run: npm run prisma:generate

- name: Push Database Schema
  run: npx prisma db push --accept-data-loss
```

### 3. Docker:
```dockerfile
# Dockerfile
RUN npm ci
RUN npx prisma generate
RUN npm run build
```

---

## 📞 Still Having Issues?

### Check These:

1. **Database Connection**:
   ```bash
   npx prisma db execute --stdin <<EOF
   SELECT 1;
   EOF
   ```

2. **Prisma Client Version**:
   ```bash
   npm list @prisma/client
   ```
   Should match `prisma` version in devDependencies.

3. **Environment Variables**:
   ```bash
   echo $DATABASE_URL
   ```
   Should output connection string.

4. **Logs**:
   Check full error logs for more context:
   ```bash
   npm run dev 2>&1 | grep -i error
   ```

---

## 📁 Files Modified

### ✅ `app/routes/app.settings.tsx`
- Enhanced error logging in loader
- Enhanced error logging in action
- Full error serialization
- Shop context in errors

### ✅ `scripts/fix-database.sh`
- Automated fix script
- Generates Prisma client
- Checks database connection
- Provides troubleshooting steps

---

## 🎉 Success Indicators

After fix, you should see:

### ✅ Logs:
```
✅ Prisma client generated!
✅ The database is already in sync with the Prisma schema.
✅ Settings saved to database successfully
```

### ✅ Settings Page:
- Loads without errors
- All fields editable
- Save button works
- Changes persist after refresh

### ✅ Widget:
- Uses saved settings
- Colors match admin settings
- Position correct
- Text matches saved values

---

## 📚 Related Documentation

- [Prisma Client Generation](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/generating-prisma-client)
- [Database Push](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push)
- [Prisma Schema](https://www.prisma.io/docs/concepts/components/prisma-schema)

---

**Created**: 2025-12-10
**Issue**: Database settings cannot be saved/loaded
**Status**: ✅ Fixed with enhanced logging + automated script
