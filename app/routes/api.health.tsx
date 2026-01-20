import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma } from "../db.server";

/**
 * Health check endpoint to diagnose deployment issues
 * Access at: https://your-app.vercel.app/api/health
 */
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: request.url,
  };

  // Check 1: Environment variables
  checks.envVars = {
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? "✅ Set" : "❌ Missing",
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? "✅ Set" : "❌ Missing",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
    SKIP_BILLING_CHECK: process.env.SKIP_BILLING_CHECK || "Not set",
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || "Not set",
  };

  // Check 2: Database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "✅ Connected";
  } catch (error: any) {
    checks.database = `❌ Error: ${error.message}`;
  }

  // Check 3: Prisma client
  try {
    const sessionCount = await prisma.session.count();
    checks.prisma = `✅ Working (${sessionCount} sessions)`;
  } catch (error: any) {
    checks.prisma = `❌ Error: ${error.message}`;
  }

  // Check 4: Check if we can query widget settings
  try {
    const settingsCount = await prisma.widgetSettings.count();
    checks.widgetSettings = `✅ ${settingsCount} shops configured`;
  } catch (error: any) {
    checks.widgetSettings = `❌ Error: ${error.message}`;
  }

  return json(checks, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
};
