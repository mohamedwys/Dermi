/**
 * Application Limits & Constants
 *
 * Centralized configuration for rate limits, timeouts, and other constraints.
 * Can be overridden via environment variables for different environments.
 */

/**
 * Rate Limiting Configuration
 */
export const RATE_LIMITS = {
  // Widget API rate limit
  WIDGET_REQUESTS_PER_MINUTE: parseInt(process.env.WIDGET_RATE_LIMIT || "100", 10),
  WIDGET_RATE_WINDOW_SECONDS: 60,

  // Widget settings API rate limit
  WIDGET_SETTINGS_REQUESTS_PER_MINUTE: parseInt(process.env.WIDGET_SETTINGS_RATE_LIMIT || "60", 10),
  WIDGET_SETTINGS_RATE_WINDOW_SECONDS: 60,

  // Chat API rate limit
  CHAT_REQUESTS_PER_MINUTE: parseInt(process.env.CHAT_RATE_LIMIT || "30", 10),
  CHAT_RATE_WINDOW_SECONDS: 60,

  // General API rate limit (fallback)
  DEFAULT_REQUESTS_PER_MINUTE: parseInt(process.env.DEFAULT_RATE_LIMIT || "100", 10),
  DEFAULT_RATE_WINDOW_SECONDS: 60,
} as const;

/**
 * Timeout Configuration (in milliseconds)
 */
export const TIMEOUTS = {
  // N8N webhook timeout
  N8N_WEBHOOK_MS: parseInt(process.env.N8N_TIMEOUT_MS || "30000", 10),

  // External API timeout
  EXTERNAL_API_MS: parseInt(process.env.EXTERNAL_API_TIMEOUT_MS || "10000", 10),

  // Database query timeout
  DATABASE_QUERY_MS: parseInt(process.env.DB_QUERY_TIMEOUT_MS || "15000", 10),
} as const;

/**
 * Widget Configuration
 */
export const WIDGET = {
  // Maximum message length
  MESSAGE_MAX_LENGTH: parseInt(process.env.WIDGET_MESSAGE_MAX_LENGTH || "2000", 10),

  // Maximum conversation history to send
  MAX_CONTEXT_MESSAGES: parseInt(process.env.MAX_CONTEXT_MESSAGES || "5", 10),

  // Cache duration for widget script (seconds)
  SCRIPT_CACHE_MAX_AGE: parseInt(process.env.WIDGET_CACHE_MAX_AGE || "60", 10),
} as const;

/**
 * Database Configuration
 */
export const DATABASE = {
  // Connection pool size (recommended for production)
  CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),

  // Pool timeout (seconds)
  POOL_TIMEOUT_SECONDS: parseInt(process.env.DB_POOL_TIMEOUT || "20", 10),

  // Connect timeout (seconds)
  CONNECT_TIMEOUT_SECONDS: parseInt(process.env.DB_CONNECT_TIMEOUT || "10", 10),
} as const;

/**
 * Analytics Configuration
 */
export const ANALYTICS = {
  // Number of days to retain detailed analytics
  RETENTION_DAYS: parseInt(process.env.ANALYTICS_RETENTION_DAYS || "90", 10),

  // Batch size for analytics aggregation
  BATCH_SIZE: parseInt(process.env.ANALYTICS_BATCH_SIZE || "1000", 10),
} as const;

/**
 * AI/ML Configuration
 */
export const AI = {
  // Maximum products to return in recommendations
  MAX_RECOMMENDATIONS: parseInt(process.env.MAX_RECOMMENDATIONS || "5", 10),

  // Minimum confidence score for AI responses (0-1)
  MIN_CONFIDENCE_THRESHOLD: parseFloat(process.env.MIN_CONFIDENCE || "0.5"),

  // Embedding model
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL || "text-embedding-3-small",

  // Maximum semantic search results
  MAX_SEMANTIC_RESULTS: parseInt(process.env.MAX_SEMANTIC_RESULTS || "5", 10),
} as const;

/**
 * GDPR Compliance
 */
export const GDPR = {
  // Days to complete data deletion request
  DATA_DELETION_DAYS: parseInt(process.env.GDPR_DELETION_DAYS || "30", 10),

  // Days to complete data export request
  DATA_EXPORT_DAYS: parseInt(process.env.GDPR_EXPORT_DAYS || "30", 10),
} as const;

/**
 * Get DATABASE_URL with connection pool parameters
 */
export function getDatabaseUrlWithPooling(baseUrl: string = process.env.DATABASE_URL || ""): string {
  if (!baseUrl) return "";

  const url = new URL(baseUrl);
  url.searchParams.set("connection_limit", DATABASE.CONNECTION_LIMIT.toString());
  url.searchParams.set("pool_timeout", DATABASE.POOL_TIMEOUT_SECONDS.toString());
  url.searchParams.set("connect_timeout", DATABASE.CONNECT_TIMEOUT_SECONDS.toString());

  return url.toString();
}
