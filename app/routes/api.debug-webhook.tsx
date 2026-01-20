/**
 * Debug endpoint to expose active webhook URL configuration
 *
 * Usage: GET /api/debug-webhook?shop=mystore.myshopify.com
 *
 * This endpoint helps diagnose webhook URL issues by showing:
 * - Environment variables
 * - Database webhook URLs
 * - Effective webhook URL that will be used
 *
 * SECURITY: This endpoint should be protected or removed in production
 */

import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { prisma as db } from "../db.server";
import { getSecureCorsHeaders, createCorsPreflightResponse } from "../lib/cors.server";
import { createLogger } from '../lib/logger.server';

const routeLogger = createLogger({ route: '/api/debug-webhook' });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Apply CORS
  if (request.method === "OPTIONS") {
    return createCorsPreflightResponse(request);
  }

  const corsHeaders = getSecureCorsHeaders(request);

  try {
    const url = new URL(request.url);
    const shopDomain = url.searchParams.get("shop");

    if (!shopDomain) {
      return json({
        error: "Missing required parameter: shop",
        usage: "GET /api/debug-webhook?shop=mystore.myshopify.com"
      }, { status: 400, headers: corsHeaders });
    }

    // Check environment variables
    const envWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const envByokUrl = process.env.N8N_WEBHOOK_BYOK;

    // Fetch shop settings from database
    const settings = await db.widgetSettings.findUnique({
      where: { shop: shopDomain },
      select: {
        shop: true,
        webhookUrl: true,
        workflowType: true,
        plan: true,
        enabled: true,
      }
    });

    if (!settings) {
      return json({
        error: `No settings found for shop: ${shopDomain}`,
        envVariables: {
          N8N_WEBHOOK_URL: envWebhookUrl ? maskWebhookUrl(envWebhookUrl) : 'NOT SET',
          N8N_WEBHOOK_BYOK: envByokUrl ? maskWebhookUrl(envByokUrl) : 'NOT SET',
        }
      }, { status: 404, headers: corsHeaders });
    }

    // Determine which webhook URL will be used (replicate logic from api.widget-settings.tsx)
    const workflowType = settings.workflowType || 'DEFAULT';
    const plan = settings.plan || 'BASIC';
    let effectiveWebhookUrl: string | undefined;
    let webhookSource: string;
    let workflowDescription: string;

    // First check if custom workflow is selected
    if (workflowType === 'CUSTOM') {
      const customWebhookUrl = settings.webhookUrl;
      const isValidCustomUrl = customWebhookUrl &&
                              typeof customWebhookUrl === 'string' &&
                              customWebhookUrl.trim() !== '' &&
                              customWebhookUrl !== 'https://' &&
                              customWebhookUrl !== 'null' &&
                              customWebhookUrl !== 'undefined' &&
                              customWebhookUrl.startsWith('https://') &&
                              customWebhookUrl.length > 8;

      if (isValidCustomUrl) {
        effectiveWebhookUrl = customWebhookUrl;
        webhookSource = 'DATABASE (custom webhook)';
        workflowDescription = 'CUSTOM N8N Workflow (merchant webhook)';
      } else {
        // Invalid custom URL - fallback to plan-based routing
        if (plan === 'BYOK') {
          effectiveWebhookUrl = envByokUrl || envWebhookUrl;
          webhookSource = 'ENVIRONMENT VARIABLE (N8N_WEBHOOK_BYOK fallback)';
          workflowDescription = 'BYOK Workflow (fallback from invalid custom URL)';
        } else {
          effectiveWebhookUrl = envWebhookUrl;
          webhookSource = 'ENVIRONMENT VARIABLE (N8N_WEBHOOK_URL fallback)';
          workflowDescription = 'DEFAULT Workflow (invalid custom URL, using fallback)';
        }
      }
    } else {
      // DEFAULT WORKFLOW: Use plan-based webhook routing
      if (plan === 'BYOK') {
        effectiveWebhookUrl = envByokUrl || envWebhookUrl;
        webhookSource = envByokUrl ? 'ENVIRONMENT VARIABLE (N8N_WEBHOOK_BYOK)' : 'ENVIRONMENT VARIABLE (N8N_WEBHOOK_URL)';
        workflowDescription = 'BYOK Plan Workflow (customer API key)';
      } else if (plan === 'Starter') {
        effectiveWebhookUrl = envWebhookUrl;
        webhookSource = 'ENVIRONMENT VARIABLE (N8N_WEBHOOK_URL)';
        workflowDescription = 'Starter Plan Workflow ($25/month)';
      } else if (plan === 'Pro') {
        effectiveWebhookUrl = envWebhookUrl;
        webhookSource = 'ENVIRONMENT VARIABLE (N8N_WEBHOOK_URL)';
        workflowDescription = 'Pro Plan Workflow ($79/month)';
      } else {
        effectiveWebhookUrl = envWebhookUrl;
        webhookSource = 'ENVIRONMENT VARIABLE (N8N_WEBHOOK_URL)';
        workflowDescription = 'DEFAULT Workflow (unknown plan)';
      }
    }

    // Log for server-side debugging
    routeLogger.info({
      shop: shopDomain,
      effectiveWebhook: effectiveWebhookUrl ? maskWebhookUrl(effectiveWebhookUrl) : 'NOT SET',
      source: webhookSource
    }, 'Webhook debug info requested');

    // Return comprehensive debug information
    return json({
      shop: shopDomain,
      timestamp: new Date().toISOString(),
      shopSettings: {
        plan: settings.plan,
        workflowType: settings.workflowType,
        enabled: settings.enabled,
        customWebhookInDb: settings.webhookUrl ? maskWebhookUrl(settings.webhookUrl) : null,
      },
      environmentVariables: {
        N8N_WEBHOOK_URL: envWebhookUrl ? maskWebhookUrl(envWebhookUrl) : 'NOT SET',
        N8N_WEBHOOK_BYOK: envByokUrl ? maskWebhookUrl(envByokUrl) : 'NOT SET',
      },
      resolution: {
        effectiveWebhookUrl: effectiveWebhookUrl ? maskWebhookUrl(effectiveWebhookUrl) : 'NOT SET',
        webhookSource,
        workflowDescription,
      },
      notes: [
        effectiveWebhookUrl ? '✅ Webhook URL is configured' : '❌ No webhook URL configured - will use fallback processing',
        settings.workflowType === 'CUSTOM' && settings.webhookUrl ? '⚠️  Using custom webhook from database (overrides env vars)' : null,
        !envWebhookUrl ? '⚠️  N8N_WEBHOOK_URL environment variable is not set' : null,
      ].filter(Boolean),
      recommendations: [
        !effectiveWebhookUrl ? 'Set N8N_WEBHOOK_URL environment variable in Vercel' : null,
        settings.webhookUrl && workflowType === 'CUSTOM' ? 'To use environment variables instead, clear the custom webhook in database or change workflow type to DEFAULT' : null,
      ].filter(Boolean)
    }, { headers: corsHeaders });

  } catch (error) {
    routeLogger.error({ error }, 'Error in debug webhook endpoint');
    return json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500, headers: corsHeaders });
  }
};

/**
 * Mask webhook URL for security
 * Shows domain and first/last 4 chars of webhook ID
 */
function maskWebhookUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    // Mask the webhook ID (last part of path)
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart.length > 8) {
        pathParts[pathParts.length - 1] = lastPart.substring(0, 4) + '****' + lastPart.substring(lastPart.length - 4);
      }
    }

    urlObj.pathname = pathParts.join('/');
    return urlObj.toString();
  } catch {
    return '[INVALID URL FORMAT]';
  }
}
