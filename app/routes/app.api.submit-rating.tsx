import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSecureCorsHeaders } from "../lib/cors.server";
import { rateLimit } from "../lib/rate-limit.server";
import { RATE_LIMITS } from "../config/limits";
import { personalizationService } from "../services/personalization.service";
import { logError, createLogger } from "../lib/logger.server";

const logger = createLogger({ service: 'SubmitRating' });

/**
 * Public API endpoint to submit chat satisfaction ratings from the widget
 * Route: /app/api/submit-rating
 *
 * This endpoint receives satisfaction rating events from the frontend widget
 * and updates the ChatSession in the database with the rating information.
 *
 * Expected POST body:
 * {
 *   shop: string;
 *   chatSessionId: string;
 *   rating: number; // 1-5 stars
 *   ratingComment?: string; // Optional feedback text
 * }
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  // Only allow POST requests
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  // Apply rate limiting to prevent abuse
  const rateLimitResponse = rateLimit(
    request,
    {
      windowMs: RATE_LIMITS.WIDGET_RATE_WINDOW_SECONDS * 1000,
      maxRequests: RATE_LIMITS.WIDGET_REQUESTS_PER_MINUTE,
      message: "Too many rating submissions. Please try again later.",
    },
    {
      useShop: true,
      namespace: "submit-rating",
    }
  );

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    // Parse request body
    const body = await request.json();
    const { shop, chatSessionId, rating, ratingComment } = body;

    // Validate required fields
    if (!shop || !chatSessionId || !rating) {
      logger.warn({ shop, chatSessionId, rating }, "Missing required fields");
      return json(
        { error: "Missing required fields: shop, chatSessionId, and rating" },
        { status: 400 }
      );
    }

    // Validate rating is between 1-5
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      logger.warn({ shop, chatSessionId, rating }, "Invalid rating value");
      return json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // Log the rating submission for debugging
    logger.info({
      shop,
      chatSessionId: chatSessionId.substring(0, 10) + "...",
      rating,
      hasComment: !!ratingComment,
    }, "⭐ Rating submitted");

    // Save the rating to the database
    await personalizationService.saveRating(shop, chatSessionId, rating, ratingComment);

    // Return success response with CORS headers
    const corsHeaders = getSecureCorsHeaders(request);
    return json(
      { success: true, message: "Rating submitted successfully" },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: any) {
    logError(error, "Error submitting rating", {
      url: request.url,
    });

    const corsHeaders = getSecureCorsHeaders(request);
    return json(
      { error: "Failed to submit rating", details: error.message },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};

// Handle OPTIONS request for CORS preflight
export const loader = async ({ request }: { request: Request }) => {
  if (request.method === "OPTIONS") {
    const corsHeaders = getSecureCorsHeaders(request);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // GET requests not allowed
  return json({ error: "Method not allowed. Use POST to submit ratings." }, { status: 405 });
};
