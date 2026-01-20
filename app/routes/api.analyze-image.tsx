import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma as db } from "../db.server";
import { getSecureCorsHeaders, createCorsPreflightResponse, isOriginAllowed } from "../lib/cors.server";
import { rateLimit, RateLimitPresets } from "../lib/rate-limit.server";
import { getAPISecurityHeaders, mergeSecurityHeaders } from "../lib/security-headers.server";
import { logError, createLogger } from "../lib/logger.server";

/**
 * Image Analysis API Route
 * 
 * This endpoint receives images from the chatbot widget and sends them to
 * your n8n workflow for analysis. The workflow can:
 * - Identify products in the image
 * - Extract text/labels
 * - Provide recommendations based on visual similarity
 * - Any custom image processing you configure in n8n
 */

export const action = async ({ request }: ActionFunctionArgs) => {
  const routeLogger = createLogger({ route: '/api/analyze-image' });

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return createCorsPreflightResponse(request);
  }

  // Verify origin (defense in depth)
  const origin = request.headers.get('origin');
  if (origin && !isOriginAllowed(origin)) {
    routeLogger.warn({ origin }, 'Origin not in whitelist');
  }

  // Apply rate limiting (stricter for image uploads)
  const rateLimitResponse = rateLimit(request, {
    windowMs: 60000, // 1 minute
    maxRequests: 10, // 10 image uploads per minute max
    message: 'Too many image uploads. Please try again in a moment.',
  }, {
    useShop: true,
    namespace: '/api/analyze-image',
  });

  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const { shop, sessionId, image, fileName } = body;

    // Validate required fields
    if (!shop || !image) {
      routeLogger.warn('Missing required fields');
      return json(
        { 
          error: "Shop domain and image are required",
          success: false 
        },
        {
          status: 400,
          headers: mergeSecurityHeaders(
            getSecureCorsHeaders(request),
            getAPISecurityHeaders()
          )
        }
      );
    }

    // Validate base64 image format
    if (!image.startsWith('data:image/')) {
      routeLogger.warn('Invalid image format');
      return json(
        { 
          error: "Invalid image format. Must be base64 encoded image.",
          success: false 
        },
        {
          status: 400,
          headers: mergeSecurityHeaders(
            getSecureCorsHeaders(request),
            getAPISecurityHeaders()
          )
        }
      );
    }

    routeLogger.info({ 
      shop, 
      sessionId, 
      fileName,
      imageSize: Math.round(image.length / 1024) // KB
    }, 'Processing image analysis request');

    // Get shop settings to determine n8n webhook URL
    let settings = await db.widgetSettings.findUnique({
      where: { shop }
    });

    // Determine n8n webhook URL for image analysis
    // You can create a separate n8n workflow specifically for image analysis
    // or use the same workflow with different handling
    const imageAnalysisWebhookUrl = process.env.N8N_IMAGE_ANALYSIS_WEBHOOK || process.env.N8N_WEBHOOK_URL;

    if (!imageAnalysisWebhookUrl) {
      routeLogger.error('No n8n webhook URL configured');
      return json(
        {
          error: "Image analysis service not configured",
          success: false
        },
        {
          status: 503,
          headers: mergeSecurityHeaders(
            getSecureCorsHeaders(request),
            getAPISecurityHeaders()
          )
        }
      );
    }

    // Send image to n8n workflow
    routeLogger.info({ webhookUrl: imageAnalysisWebhookUrl }, 'Sending to n8n workflow');

    const n8nResponse = await fetch(imageAnalysisWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shop,
        sessionId,
        image, // Base64 image
        fileName,
        timestamp: new Date().toISOString(),
        // Add any additional context
        context: {
          userAgent: request.headers.get('user-agent'),
          locale: settings?.interfaceLanguage || 'en',
        }
      })
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      routeLogger.error({ 
        status: n8nResponse.status, 
        error: errorText 
      }, 'n8n workflow failed');

      return json(
        {
          error: "Image analysis failed",
          analysis: "I couldn't analyze the image. Please try again or describe what you're looking for.",
          success: false
        },
        {
          status: 500,
          headers: mergeSecurityHeaders(
            getSecureCorsHeaders(request),
            getAPISecurityHeaders()
          )
        }
      );
    }

    const result = await n8nResponse.json();
    const responseTime = Date.now() - startTime;

    routeLogger.info({ 
      responseTime,
      hasAnalysis: !!result.analysis,
      hasRecommendations: !!result.recommendations
    }, 'Image analysis completed');

    // Save to database for analytics (non-blocking)
    try {
      const userProfile = await db.userProfile.findUnique({
        where: {
          shop_sessionId: {
            shop,
            sessionId: sessionId || `temp_${Date.now()}`
          }
        }
      });

      if (userProfile) {
        const chatSession = await db.chatSession.findFirst({
          where: {
            shop,
            userProfileId: userProfile.id,
            lastMessageAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          orderBy: {
            lastMessageAt: 'desc'
          }
        });

        if (chatSession) {
          await db.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              role: 'user',
              content: `[Image uploaded: ${fileName || 'image'}]`,
              intent: 'IMAGE_ANALYSIS',
              sentiment: 'neutral',
              confidence: 1.0,
              productsShown: JSON.stringify([]),
              metadata: JSON.stringify({
                type: 'image_upload',
                fileName,
                imageSize: Math.round(image.length / 1024),
                timestamp: new Date().toISOString()
              })
            }
          });

          await db.chatMessage.create({
            data: {
              sessionId: chatSession.id,
              role: 'assistant',
              content: result.analysis || 'Image analyzed',
              intent: 'IMAGE_ANALYSIS',
              sentiment: 'neutral',
              confidence: result.confidence || 0.8,
              productsShown: JSON.stringify(result.recommendations?.map((p: any) => p.id) || []),
              metadata: JSON.stringify({
                type: 'image_analysis_result',
                responseTime,
                hasRecommendations: !!result.recommendations,
                timestamp: new Date().toISOString()
              })
            }
          });
        }
      }
    } catch (dbError) {
      routeLogger.warn({ error: dbError }, 'Failed to save to database (non-blocking)');
    }

    // Return analysis result
    return json(
      {
        success: true,
        analysis: result.analysis || result.message || 'Image analyzed successfully',
        recommendations: result.recommendations || [],
        confidence: result.confidence || 0.8,
        metadata: {
          responseTime,
          timestamp: new Date().toISOString()
        }
      },
      {
        headers: mergeSecurityHeaders(
          getSecureCorsHeaders(request),
          getAPISecurityHeaders()
        )
      }
    );

  } catch (error) {
    logError(error, "Image Analysis API Error");
    const responseTime = Date.now() - startTime;

    return json(
      {
        error: "Internal server error",
        analysis: "Sorry, I couldn't process your image. Please try again.",
        success: false,
        metadata: {
          responseTime,
          error: true
        }
      },
      {
        status: 500,
        headers: mergeSecurityHeaders(
          getSecureCorsHeaders(request),
          getAPISecurityHeaders()
        )
      }
    );
  }
};