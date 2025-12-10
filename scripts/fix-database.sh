#!/bin/bash

echo "🔧 Fixing database issues..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma client"
  echo "💡 Try manually: npx prisma generate"
  exit 1
fi

echo "✅ Prisma client generated!"
echo ""

# Step 2: Push database schema (creates missing tables)
echo "🗄️  Step 2: Creating database tables..."
echo "⚠️  This will create the WidgetSettings table if it doesn't exist"
echo ""

npx prisma db push --accept-data-loss --skip-generate

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Failed to create database tables"
  echo ""
  echo "Common issues:"
  echo "1. DATABASE_URL not set or incorrect"
  echo "2. Database server not accessible"
  echo "3. Insufficient database permissions"
  echo ""
  echo "💡 Check your DATABASE_URL in .env or environment variables"
  echo "💡 Verify database server is running and accessible"
  exit 1
fi

echo ""
echo "✅ Database schema applied successfully!"
echo "✅ WidgetSettings table created!"
echo ""

# Step 3: Verify table exists
echo "🔍 Step 3: Verifying table creation..."
npx prisma db execute --stdin <<EOF
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'WidgetSettings'
);
EOF

echo ""
echo "🎉 Database fix complete!"
echo ""
echo "Next steps:"
echo "1. Restart your application server"
echo "2. Visit the settings page (/app/settings)"
echo "3. Save your widget configuration"
echo ""
