import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma as db } from "../db.server";
import { getWebhookSecurityHeaders } from "../lib/security-headers.server";
import { logger } from "../lib/logger.server";
import { randomBytes } from "crypto";

/**
 * GDPR Webhook: Customer Data Redaction
 *
 * When a customer requests deletion of their data (right to be forgotten),
 * Shopify sends this webhook. We must delete ALL personal data for this customer.
 *
 * Required by Shopify App Store for GDPR compliance.
 * Reference: https://shopify.dev/docs/apps/build/privacy-law-compliance
 *
 * Timeline: Must complete within 30 days of receiving the request.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const correlationId = randomBytes(16).toString("hex");
  const webhookLogger = logger.child({ correlationId, webhook: "customers/redact" });

  webhookLogger.info({
    headers: {
      topic: request.headers.get("X-Shopify-Topic"),
      domain: request.headers.get("X-Shopify-Shop-Domain"),
    }
  }, "GDPR webhook received: customer data redaction");

  const { shop, payload, topic } = await authenticate.webhook(request);

  webhookLogger.info({ shop, topic }, "Webhook authenticated successfully");


  try {
    // Extract customer information from payload
    const customerId = payload.customer?.id?.toString();
    const customerEmail = payload.customer?.email;
    const customerPhone = payload.customer?.phone;

    webhookLogger.info({
      customerId: customerId ? "[REDACTED]" : undefined,
      hasEmail: !!customerEmail,
      hasPhone: !!customerPhone
    }, "Processing customer data redaction");

    if (!customerId && !customerEmail) {
      webhookLogger.warn("No customer identifier in payload");
      return new Response(JSON.stringify({
        error: "No customer identifier provided"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...getWebhookSecurityHeaders() }
      });
    }


    // Find all user profiles for this customer
    const userProfiles = await db.userProfile.findMany({
      where: {
        shop,
        ...(customerId ? { customerId } : {}),
      },
      select: {
        id: true,
        sessionId: true,
      },
    });

    const profileIds = userProfiles.map((p) => p.id);

    webhookLogger.info({
      profileCount: profileIds.length
    }, "Found customer profiles to delete");

    if (profileIds.length > 0) {
      // Delete all related data in a transaction to ensure data integrity
      await db.$transaction(async (tx) => {
        // Step 1: Find all chat sessions for these profiles
        const chatSessions = await tx.chatSession.findMany({
          where: {
            userProfileId: { in: profileIds },
          },
          select: { id: true },
        });

        const sessionIds = chatSessions.map((s) => s.id);

        // Step 2: Delete all chat messages for these sessions
        if (sessionIds.length > 0) {
          const deletedMessages = await tx.chatMessage.deleteMany({
            where: {
              sessionId: { in: sessionIds },
            },
          });
        }

        // Step 3: Delete all chat sessions
        if (sessionIds.length > 0) {
          const deletedSessions = await tx.chatSession.deleteMany({
            where: {
              id: { in: sessionIds },
            },
          });
        }

        // Step 4: Delete all user profiles
        const deletedProfiles = await tx.userProfile.deleteMany({
          where: {
            id: { in: profileIds },
          },
        });

        // Note: We keep aggregated analytics data as it doesn't contain
        // personal information, only counts and averages.
        // If your analytics contain personal data, delete those records too.
      });

      webhookLogger.info({
        profilesDeleted: profileIds.length,
        customerId: customerId ? "[REDACTED]" : undefined
      }, "Customer data deleted successfully");

      return new Response(JSON.stringify({
        success: true,
        message: "Customer data deleted successfully",
        customer_id: customerId,
        profiles_deleted: profileIds.length,
        deleted_at: new Date().toISOString(),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...getWebhookSecurityHeaders() }
      });
    } else {
      webhookLogger.info({
        customerId: customerId ? "[REDACTED]" : undefined
      }, "No customer data found to delete");

      return new Response(JSON.stringify({
        success: true,
        message: "No customer data found to delete",
        customer_id: customerId,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...getWebhookSecurityHeaders() }
      });
    }

  } catch (error) {
    webhookLogger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, "Error deleting customer data - manual intervention required");

    // Log the error but return success to Shopify
    // This prevents webhook retries while we investigate the issue
    // Make sure to manually verify deletion completed
    return new Response(JSON.stringify({
      error: "Error deleting customer data",
      message: error instanceof Error ? error.message : 'Unknown error',
      // Still return 200 to prevent retries - manual intervention needed
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...getWebhookSecurityHeaders() }
    });
  }
};
