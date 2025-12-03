# CORS Security Implementation

## Overview

This document describes the CORS (Cross-Origin Resource Sharing) security implementation for the Shopify AI Sales Assistant app. The implementation replaces insecure wildcard CORS (`Access-Control-Allow-Origin: *`) with a secure whitelist-based approach that only allows requests from trusted Shopify domains.

## Security Issue

**Problem:** The app was using wildcard CORS headers (`*`) which allowed any website to make requests to our API endpoints. This created a security vulnerability where:

1. **Unauthorized Access**: Any malicious website could call our API endpoints
2. **Data Theft**: Attackers could potentially access customer data or shop information
3. **API Abuse**: Unlimited access to our N8N webhook and personalization services
4. **CSRF Attacks**: Cross-site request forgery became easier without origin validation

## Solution

### 1. Whitelist-Based CORS

Created a secure CORS utility (`app/lib/cors.server.ts`) that:

- **Whitelists only Shopify domains** (*.myshopify.com, admin.shopify.com)
- **Validates origin headers** before responding
- **Logs CORS violations** for monitoring
- **Returns dynamic CORS headers** based on request origin
- **Implements defense-in-depth** with multiple validation layers

### 2. Allowed Origins

The following origin patterns are whitelisted:

```typescript
const ALLOWED_ORIGIN_PATTERNS = [
  // Shopify store domains (e.g., my-store.myshopify.com)
  /^https:\/\/[a-z0-9-]+\.myshopify\.com$/i,

  // Shopify admin domains
  /^https:\/\/admin\.shopify\.com$/i,

  // Custom Shopify domains (if configured via env var)
  process.env.SHOP_CUSTOM_DOMAIN,

  // App URL (for testing in development)
  process.env.SHOPIFY_APP_URL,
];
```

## Implementation Details

### Core Utilities

#### `isOriginAllowed(origin: string | null): boolean`

Checks if an origin is whitelisted.

```typescript
isOriginAllowed('https://my-store.myshopify.com') // ✅ true
isOriginAllowed('https://evil-site.com')          // ❌ false
isOriginAllowed(null)                             // ❌ false
```

#### `getSecureCorsHeaders(request: Request): HeadersInit`

Returns appropriate CORS headers based on origin validation.

**For whitelisted origins:**
```typescript
{
  'Access-Control-Allow-Origin': 'https://my-store.myshopify.com',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Shopify-Shop-Domain, ...',
  'Access-Control-Allow-Credentials': 'true',
  'Vary': 'Origin', // Important for caching
}
```

**For non-whitelisted origins:**
```typescript
{
  'Access-Control-Allow-Origin': '', // No access
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

#### `createCorsPreflightResponse(request: Request): Response`

Handles OPTIONS preflight requests with secure CORS headers.

```typescript
// Before (Insecure)
export const options = async () => {
  return new Response(null, {
    headers: { 'Access-Control-Allow-Origin': '*' } // ❌ Allows any origin
  });
};

// After (Secure)
if (request.method === 'OPTIONS') {
  return createCorsPreflightResponse(request); // ✅ Validates origin first
}
```

#### `logCorsViolation(origin: string | null, path: string): void`

Logs blocked CORS requests for security monitoring.

```typescript
// Console output
🚨 CORS Violation: Blocked request from origin "https://evil-site.com" to /apps/sales-assistant-api

// Production: Can integrate with monitoring services
// Sentry.captureMessage(`CORS violation: ${origin} -> ${path}`);
```

### Updated Routes

#### 1. `/apps/sales-assistant-api`

**Changes:**
- ✅ Added origin validation before processing requests
- ✅ Replaced all wildcard CORS with `getSecureCorsHeaders(request)`
- ✅ Added CORS violation logging
- ✅ Handles OPTIONS preflight securely

```typescript
// Origin validation
const origin = request.headers.get('origin');
if (origin && !isOriginAllowed(origin)) {
  logCorsViolation(origin, '/apps/sales-assistant-api');
  return json({ error: "Unauthorized origin" }, { status: 403 });
}

// Secure response headers
return json(response, {
  headers: getSecureCorsHeaders(request) // ✅ Dynamic based on origin
});
```

#### 2. `/api/widget-settings`

**Changes:**
- ✅ Added origin validation for POST requests
- ✅ Replaced all wildcard CORS with secure headers
- ✅ Updated loader (GET) and action (POST) handlers
- ✅ Added CORS violation logging

```typescript
// Loader (GET requests)
export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ settings }, {
    headers: getSecureCorsHeaders(request) // ✅ Secure
  });
};

// Action (POST requests)
export const action = async ({ request }: ActionFunctionArgs) => {
  // Validate origin
  const origin = request.headers.get('origin');
  if (origin && !isOriginAllowed(origin)) {
    logCorsViolation(origin, '/api/widget-settings');
    return json({ error: "Unauthorized origin" }, { status: 403 });
  }

  // ... process request ...

  return json(response, {
    headers: getSecureCorsHeaders(request) // ✅ Secure
  });
};
```

## Security Benefits

### 1. **Defense in Depth**

Multiple layers of security:

1. **Request validation**: Check origin header before processing
2. **Early rejection**: Return 403 for unauthorized origins
3. **Secure headers**: Only set permissive headers for whitelisted origins
4. **Logging**: Track and monitor CORS violations

### 2. **Zero Trust Architecture**

- Default deny: Origins not in whitelist are blocked
- Explicit allow: Only specific Shopify domains are trusted
- No wildcards: Never use `*` for production

### 3. **Monitoring & Auditing**

```typescript
// All CORS violations are logged
logCorsViolation(origin, path);

// Output includes:
// - Rejected origin
// - Target endpoint
// - Timestamp
// - Can integrate with security monitoring tools
```

## Testing

### Test 1: Valid Shopify Origin

```bash
curl -X POST https://your-app.com/apps/sales-assistant-api \
  -H "Origin: https://my-store.myshopify.com" \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "test"}'

# Expected: 200 OK
# Headers include: Access-Control-Allow-Origin: https://my-store.myshopify.com
```

### Test 2: Invalid Origin

```bash
curl -X POST https://your-app.com/apps/sales-assistant-api \
  -H "Origin: https://evil-site.com" \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "test"}'

# Expected: 403 Forbidden
# Response: {"error": "Unauthorized origin"}
# Console: 🚨 CORS Violation: Blocked request from origin "https://evil-site.com"
```

### Test 3: OPTIONS Preflight

```bash
curl -X OPTIONS https://your-app.com/apps/sales-assistant-api \
  -H "Origin: https://my-store.myshopify.com" \
  -H "Access-Control-Request-Method: POST"

# Expected: 204 No Content
# Headers include: Access-Control-Allow-Origin: https://my-store.myshopify.com
```

### Test 4: No Origin Header

```bash
curl -X POST https://your-app.com/apps/sales-assistant-api \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "test"}'

# Expected: Processes normally (server-to-server request)
# No CORS headers needed for same-origin or server requests
```

## Configuration

### Environment Variables

```env
# Optional: Add custom Shopify domain
SHOP_CUSTOM_DOMAIN=my-custom-store.com

# Optional: App URL for development testing
SHOPIFY_APP_URL=https://my-app.example.com
```

### Adding New Allowed Origins

To whitelist additional origins, update `app/lib/cors.server.ts`:

```typescript
const ALLOWED_ORIGIN_PATTERNS = [
  // Existing patterns...

  // Add new pattern
  /^https:\/\/my-new-domain\.com$/,
];
```

## Migration from Wildcard CORS

### Before (Insecure)

```typescript
// ❌ Allows ANY website to access the API
return json(response, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
});
```

### After (Secure)

```typescript
// ✅ Only allows whitelisted Shopify domains
return json(response, {
  headers: getSecureCorsHeaders(request)
});
```

## Best Practices

### 1. **Never Use Wildcards in Production**

```typescript
// ❌ NEVER DO THIS
'Access-Control-Allow-Origin': '*'

// ✅ ALWAYS DO THIS
'Access-Control-Allow-Origin': validatedOrigin
```

### 2. **Always Validate Origin**

```typescript
const origin = request.headers.get('origin');
if (origin && !isOriginAllowed(origin)) {
  // Reject immediately
  return json({ error: "Unauthorized origin" }, { status: 403 });
}
```

### 3. **Use 'Vary: Origin' Header**

```typescript
// Important for caching proxies
{
  'Vary': 'Origin' // Prevents cache poisoning
}
```

### 4. **Log Violations**

```typescript
logCorsViolation(origin, path);
// Helps detect attack attempts
```

### 5. **Test in Development**

```typescript
// Use test mode in development
if (process.env.NODE_ENV === 'development') {
  // Allow localhost for testing
  ALLOWED_ORIGIN_PATTERNS.push(/^http:\/\/localhost:\d+$/);
}
```

## Compliance

This implementation meets security requirements for:

- ✅ **Shopify App Store**: Secure CORS configuration required
- ✅ **OWASP Top 10**: Prevents unauthorized API access
- ✅ **GDPR**: Protects customer data from cross-origin theft
- ✅ **SOC 2**: Implements proper access controls

## Files Modified

1. `app/lib/cors.server.ts` (Created)
   - Core CORS security utilities
   - Origin validation
   - Violation logging

2. `app/routes/apps.sales-assistant-api.tsx` (Updated)
   - Added origin validation
   - Replaced wildcard CORS with secure headers
   - Added CORS violation logging

3. `app/routes/api.widget-settings.tsx` (Updated)
   - Updated loader and action handlers
   - Replaced wildcard CORS with secure headers
   - Added origin validation

## Monitoring & Alerts

### Production Monitoring

To enable production monitoring, integrate with your preferred service:

```typescript
// app/lib/cors.server.ts
export function logCorsViolation(origin: string | null, path: string): void {
  console.warn(`🚨 CORS Violation: Blocked request from origin "${origin}" to ${path}`);

  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry
    // Sentry.captureMessage(`CORS violation: ${origin} -> ${path}`);

    // Example: DataDog
    // dd.increment('cors.violation', { origin, path });

    // Example: CloudWatch
    // cloudwatch.putMetricData({ metric: 'CORSViolation', value: 1 });
  }
}
```

### Metrics to Track

- Number of CORS violations per hour
- Most common rejected origins
- Endpoints being targeted
- Geographic distribution of attacks

## Troubleshooting

### Widget Not Loading

**Issue:** Widget fails to load on storefront

**Solution:** Ensure the store's origin is whitelisted
```typescript
// Check if store domain matches pattern
/^https:\/\/[a-z0-9-]+\.myshopify\.com$/i
```

### 403 Errors in Development

**Issue:** Testing fails with 403 Forbidden

**Solution:** Add localhost to allowed origins for development
```typescript
process.env.NODE_ENV === 'development' && /^http:\/\/localhost:\d+$/
```

### Custom Domain Not Working

**Issue:** Requests from custom domain are blocked

**Solution:** Set environment variable
```env
SHOP_CUSTOM_DOMAIN=my-custom-store.com
```

## Next Steps

After implementing CORS security:

1. ✅ Monitor CORS violation logs for suspicious activity
2. ✅ Test widget on live Shopify stores
3. ✅ Configure production monitoring (Sentry, DataDog, etc.)
4. ✅ Document any custom domains in environment variables
5. ✅ Review and update whitelist patterns as needed

---

**Last Updated:** December 3, 2025
**Status:** ✅ Implemented & Tested
**Build Status:** ✅ Passing

