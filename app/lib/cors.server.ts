/**
 * CORS Security Utility
 *
 * Provides secure CORS headers that only allow whitelisted Shopify domains.
 * Prevents unauthorized access to API endpoints.
 *
 * SECURITY: Never use wildcard (*) for Access-Control-Allow-Origin in production!
 */

import { logger } from './logger.server';

/**
 * Allowed origin patterns for CORS
 */
const ALLOWED_ORIGIN_PATTERNS = [
  // Shopify store domains
  /^https:\/\/[a-z0-9-]+\.myshopify\.com$/i,

  // Shopify admin domains
  /^https:\/\/admin\.shopify\.com$/i,

  // Custom Shopify domains (if configured)
  process.env.SHOP_CUSTOM_DOMAIN
    ? new RegExp(`^https://${process.env.SHOP_CUSTOM_DOMAIN.replace(/\./g, '\\.')}$`)
    : null,

  // App URL (for testing in development)
  process.env.SHOPIFY_APP_URL
    ? new RegExp(`^${process.env.SHOPIFY_APP_URL.replace(/\./g, '\\.')}$`)
    : null,
].filter(Boolean) as (RegExp | null)[];

/**
 * Check if origin is allowed
 *
 * @param origin - The origin header from the request
 * @returns True if origin is whitelisted
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) {
    // No origin header - might be same-origin request or server-to-server
    return false;
  }

  // Check against all allowed patterns
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => {
    if (pattern instanceof RegExp) {
      return pattern.test(origin);
    }
    return false;
  });
}

/**
 * Get secure CORS headers based on request origin
 *
 * Only returns permissive headers if origin is whitelisted.
 * Returns restrictive headers otherwise.
 *
 * @param request - The incoming request
 * @returns CORS headers object
 */
export function getSecureCorsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get('origin');

  // Check if origin is allowed
  const allowed = isOriginAllowed(origin);

  if (allowed && origin) {
    // Origin is whitelisted - allow the request
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Shop-Domain, X-Shopify-Customer-Access-Token',
      'Access-Control-Allow-Credentials': 'true',
      'Vary': 'Origin', // Important for caching
    };
  } else {
    // Origin is not whitelisted - restrict access
    // SECURITY: Omit Access-Control-Allow-Origin header instead of empty string
    // This is clearer to browsers that CORS is denied
    return {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
  }
}

/**
 * Create a Response with secure CORS headers
 *
 * Convenience function for OPTIONS preflight requests
 *
 * @param request - The incoming request
 * @returns Response with CORS headers
 */
export function createCorsPreflightResponse(request: Request): Response {
  const corsHeaders = getSecureCorsHeaders(request);

  return new Response(null, {
    status: 204, // No Content
    headers: corsHeaders,
  });
}

/**
 * Add secure CORS headers to an existing Response
 *
 * @param response - The response to add headers to
 * @param request - The original request
 * @returns Response with CORS headers added
 */
export function addSecureCorsHeaders(response: Response, request: Request): Response {
  const corsHeaders = getSecureCorsHeaders(request);

  // Clone the response and add CORS headers
  const newResponse = new Response(response.body, response);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });

  return newResponse;
}

/**
 * Log CORS violations for monitoring
 *
 * @param origin - The rejected origin
 * @param path - The request path
 */
export function logCorsViolation(origin: string | null, path: string): void {
  logger.warn({ origin, path }, 'CORS violation: Blocked request from unauthorized origin');

  // In production, you might want to send this to a monitoring service
  // Example: Sentry, LogRocket, Datadog, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to monitoring service
    // Example: Sentry.captureMessage(`CORS violation: ${origin} -> ${path}`);
  }
}
