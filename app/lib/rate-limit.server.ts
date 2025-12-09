/**
 * Rate Limiting Implementation
 *
 * This module provides rate limiting functionality to prevent API abuse.
 * Uses in-memory storage with automatic cleanup for serverless environments.
 *
 * Features:
 * - Configurable rate limits per endpoint
 * - Multiple rate limit windows (per minute, hour, day)
 * - IP-based and shop-based rate limiting
 * - Automatic cleanup of expired entries
 * - Support for serverless/edge functions
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string; // Custom error message
}

// ============================================================================
// In-Memory Store
// ============================================================================

class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup process (runs every minute)
    this.startCleanup();
  }

  /**
   * Get rate limit entry for a key
   */
  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  /**
   * Set rate limit entry for a key
   */
  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  /**
   * Delete rate limit entry for a key
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt < now) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.store.delete(key));

    if (keysToDelete.length > 0) {
      logger.info(`🧹 Rate limit cleanup: Removed ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Start automatic cleanup
   */
  private startCleanup(): void {
    // Only run cleanup in Node.js environment (not in edge/browser)
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 60000); // Run every minute

      // Don't block process exit
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Stop automatic cleanup
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get store statistics
   */
  getStats(): { totalEntries: number; activeEntries: number } {
    const now = Date.now();
    let activeEntries = 0;

    for (const entry of this.store.values()) {
      if (entry.resetAt >= now) {
        activeEntries++;
      }
    }

    return {
      totalEntries: this.store.size,
      activeEntries,
    };
  }
}

// Global store instance
const rateLimitStore = new RateLimitStore();

// ============================================================================
// Rate Limit Configurations
// ============================================================================

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Strict: 10 requests per minute
   * Use for: Authentication, password reset, sensitive operations
   */
  STRICT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many requests. Please wait a minute before trying again.',
  },

  /**
   * Standard: 60 requests per minute
   * Use for: General API endpoints
   */
  STANDARD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Rate limit exceeded. Please slow down your requests.',
  },

  /**
   * Moderate: 100 requests per minute
   * Use for: Chat/messaging endpoints
   */
  MODERATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'You are sending messages too quickly. Please wait a moment.',
  },

  /**
   * Generous: 300 requests per minute
   * Use for: Widget settings, public endpoints
   */
  GENEROUS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300,
    message: 'Rate limit exceeded. Please try again in a minute.',
  },

  /**
   * Hourly limit: 1000 requests per hour
   * Use for: Secondary protection layer
   */
  HOURLY: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: 'Hourly rate limit exceeded. Please try again later.',
  },
} as const;

// ============================================================================
// Rate Limiting Functions
// ============================================================================

/**
 * Extract identifier from request
 * Uses IP address, shop domain, or custom identifier
 */
export function getRequestIdentifier(
  request: Request,
  options?: {
    useShop?: boolean;
    customKey?: string;
  }
): string {
  // Use custom key if provided
  if (options?.customKey) {
    return options.customKey;
  }

  // Try to get shop domain if requested
  if (options?.useShop) {
    const url = new URL(request.url);
    const shop = url.searchParams.get('shop') || request.headers.get('X-Shopify-Shop-Domain');
    if (shop) {
      return `shop:${shop}`;
    }
  }

  // Get IP address from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  const ip = forwardedFor?.split(',')[0].trim() || realIp || cfConnectingIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Check if request is rate limited
 *
 * @param identifier - Unique identifier for the requester (IP, shop, etc.)
 * @param config - Rate limit configuration
 * @param namespace - Optional namespace to separate different endpoints
 * @returns Object with isLimited flag and rate limit info
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  namespace: string = 'default'
): {
  isLimited: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number;
} {
  const key = `${namespace}:${identifier}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No existing entry - create new one
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      isLimited: false,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
      retryAfter: 0,
    };
  }

  // Increment existing entry
  entry.count++;
  rateLimitStore.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const isLimited = entry.count > config.maxRequests;
  const retryAfter = isLimited ? Math.ceil((entry.resetAt - now) / 1000) : 0;

  return {
    isLimited,
    remaining,
    resetAt: entry.resetAt,
    retryAfter,
  };
}

/**
 * Apply rate limit to a request
 *
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @param options - Additional options
 * @returns null if allowed, Response if rate limited
 */
export function rateLimit(
  request: Request,
  config: RateLimitConfig,
  options?: {
    useShop?: boolean;
    customKey?: string;
    namespace?: string;
  }
): Response | null {
  const identifier = getRequestIdentifier(request, options);
  const namespace = options?.namespace || new URL(request.url).pathname;

  const result = checkRateLimit(identifier, config, namespace);

  // Add rate limit headers
  const headers = new Headers({
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  });

  if (result.isLimited) {
    headers.set('Retry-After', result.retryAfter.toString());

    logger.warn(
      `⚠️ Rate limit exceeded for ${identifier} on ${namespace} ` +
      `(${result.retryAfter}s until reset)`
    );

    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: config.message || 'Too many requests. Please try again later.',
        retryAfter: result.retryAfter,
        resetAt: new Date(result.resetAt).toISOString(),
      }),
      {
        status: 429,
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return null;
}

/**
 * Create a rate limit middleware for Remix routes
 */
export function createRateLimiter(config: RateLimitConfig, options?: {
  useShop?: boolean;
  namespace?: string;
}) {
  return (request: Request): Response | null => {
    return rateLimit(request, config, options);
  };
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string, namespace: string = 'default'): void {
  const key = `${namespace}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get rate limit store statistics
 */
export function getRateLimitStats() {
  return rateLimitStore.getStats();
}

/**
 * Manual cleanup of expired rate limit entries
 */
export function cleanupRateLimits(): void {
  rateLimitStore.cleanup();
}

// ============================================================================
// Composite Rate Limiting
// ============================================================================

/**
 * Apply multiple rate limits (e.g., per-minute AND per-hour)
 *
 * @param request - The incoming request
 * @param configs - Array of rate limit configurations with namespaces
 * @param options - Additional options
 * @returns null if allowed, Response if any limit exceeded
 */
export function compositeRateLimit(
  request: Request,
  configs: Array<{ config: RateLimitConfig; namespace: string }>,
  options?: {
    useShop?: boolean;
    customKey?: string;
  }
): Response | null {
  const identifier = getRequestIdentifier(request, options);

  for (const { config, namespace } of configs) {
    const result = checkRateLimit(identifier, config, namespace);

    if (result.isLimited) {
      logger.warn(
        `⚠️ Composite rate limit exceeded for ${identifier} on ${namespace} ` +
        `(${result.retryAfter}s until reset)`
      );

      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests. Please try again later.',
          retryAfter: result.retryAfter,
          resetAt: new Date(result.resetAt).toISOString(),
          limitType: namespace,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': result.retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
          },
        }
      );
    }
  }

  return null;
}
