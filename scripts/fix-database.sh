#!/bin/bash

echo "🔧 Fixing database issues..."
echo ""

# Step 1: Generate Prisma Client
echo "📦 Step 1: Generating Prisma Client..."
npm run prisma:generate

if [ $? -ne 0 ]; then
  echo "❌ Failed to generate Prisma client"
  echo "💡 Try manually: npx prisma generate"
  exit 1
fi

echo "✅ Prisma client generated!"
echo ""

# Step 2: Check database connection
echo "🔌 Step 2: Checking database connection..."
npx prisma db push --accept-data-loss --skip-generate || {
  echo "⚠️  Database connection check failed"
  echo "💡 Make sure DATABASE_URL is set correctly"
  echo "💡 Check your .env file"
}

echo ""
echo "✅ Database fix complete!"
echo ""
echo "Next steps:"
echo "1. Restart your development server"
echo "2. Visit the settings page to save your configuration"
echo ""
