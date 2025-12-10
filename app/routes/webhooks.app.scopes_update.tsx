import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma as db } from "../db.server";
import { getWebhookSecurityHeaders } from "../lib/security-headers.server";
import { logger } from "../lib/logger.server";
import { randomBytes } from "crypto";

/**
 * App Scopes Update Webhook
 *
 * Triggered when the app's OAuth scopes are updated.
 * We need to update stored session data with the new scopes.
 *
 * Note: This is important for maintaining accurate session scope tracking.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const correlationId = randomBytes(16).toString("hex");
  const webhookLogger = logger.child({ correlationId, webhook: "app/scopes_update" });

  webhookLogger.info({
    headers: {
      topic: request.headers.get("X-Shopify-Topic"),
      domain: request.headers.get("X-Shopify-Shop-Domain"),
    }
  }, "Webhook received: app scopes updated");

  try {
    const { payload, session, topic, shop } = await authenticate.webhook(request);

    webhookLogger.info({ shop, topic }, "Webhook authenticated successfully");

    const currentScopes = payload.current as string[];
    const previousScopes = payload.previous as string[];

    webhookLogger.info({
      shop,
      currentScopes,
      previousScopes,
      scopesAdded: currentScopes.filter(s => !previousScopes.includes(s)),
      scopesRemoved: previousScopes.filter(s => !currentScopes.includes(s))
    }, "Processing scope update");

    if (session) {
      await db.session.update({
        where: {
          id: session.id
        },
        data: {
          scope: currentScopes.toString(),
        },
      });

      webhookLogger.info({
        shop,
        sessionId: session.id,
        newScopes: currentScopes
      }, "Session scopes updated successfully");

      return new Response(JSON.stringify({
        success: true,
        shop,
        scopes_updated: true
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...getWebhookSecurityHeaders()
        }
      });
    } else {
      webhookLogger.warn({
        shop,
        message: "No session found to update"
      }, "Scopes update skipped - no session");

      return new Response(JSON.stringify({
        success: true,
        shop,
        scopes_updated: false,
        message: "No session found"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...getWebhookSecurityHeaders()
        }
      });
    }
  } catch (error) {
    webhookLogger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, "Error processing scopes update");

    return new Response(JSON.stringify({
      error: "Error updating scopes",
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 200, // Return 200 to prevent retries
      headers: {
        "Content-Type": "application/json",
        ...getWebhookSecurityHeaders()
      }
    });
  }
};
