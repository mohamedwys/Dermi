import { createLogger } from '../lib/logger.server';

const logger = createLogger({ service: 'PolicyCacheService' });

// Cache entry structure
interface CacheEntry {
  policies: CachedShopPolicies;
  timestamp: number;
}

// Cached policy structure from Shopify REST API
export interface CachedShopPolicies {
  shopName?: string;
  refundPolicy?: string | null;
  shippingPolicy?: string | null;
  privacyPolicy?: string | null;
  termsOfService?: string | null;
  contactEmail?: string | null;
}

// ShopPolicies format for passing to N8N context
export interface ShopPolicies {
  shopName?: string;
  returns?: string | null;
  shipping?: string | null;
  privacy?: string | null;
  termsOfService?: string | null;
  contactEmail?: string | null;
}

// In-memory cache for policies
const policyCache = new Map<string, CacheEntry>();

// Cache TTL: 1 hour in milliseconds
const CACHE_TTL_MS = 60 * 60 * 1000;

// Request timeout: 10 seconds
const FETCH_TIMEOUT_MS = 10000;

/**
 * Fetch shop policies from Shopify REST Admin API
 *
 * IMPORTANT: Shopify's GraphQL Admin API does NOT expose shop policies.
 * We MUST use the REST API endpoint /policies.json
 *
 * @param shopDomain - The shop's domain (e.g., "mystore.myshopify.com")
 * @param accessToken - The shop's access token from session
 * @returns Cached shop policies or null if fetch fails
 */
export async function fetchShopPolicies(
  shopDomain: string,
  accessToken: string
): Promise<CachedShopPolicies | null> {
  // Check cache first
  const cached = policyCache.get(shopDomain);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    logger.debug({ shop: shopDomain }, 'Using cached policies');
    return cached.policies;
  }

  logger.info({ shop: shopDomain }, 'Fetching policies from Shopify REST API');

  // Use AbortController for proper timeout handling
  // (Promise.race with setTimeout causes unhandled rejections)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://${shopDomain}/admin/api/2024-01/policies.json`,
      {
        method: 'GET',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      logger.error({
        shop: shopDomain,
        status: response.status,
        statusText: response.statusText
      }, 'Failed to fetch policies from Shopify REST API');
      return null;
    }

    const data = await response.json();

    // Map Shopify policy response to our structure
    // Shopify returns: { policies: [{ title: "Refund Policy", body: "...", url: "..." }, ...] }
    const policies = mapShopifyPolicies(data.policies || [], shopDomain);

    // Cache the result
    policyCache.set(shopDomain, {
      policies,
      timestamp: Date.now()
    });

    logger.info({
      shop: shopDomain,
      hasRefund: !!policies.refundPolicy,
      hasShipping: !!policies.shippingPolicy,
      hasPrivacy: !!policies.privacyPolicy,
      hasTerms: !!policies.termsOfService
    }, 'Successfully fetched and cached policies');

    return policies;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      logger.error({ shop: shopDomain }, 'Policy fetch timed out after 10 seconds');
    } else {
      logger.error({
        shop: shopDomain,
        error: error.message
      }, 'Failed to fetch policies');
    }

    return null;
  }
}

/**
 * Map Shopify REST API policies array to our structure
 */
function mapShopifyPolicies(
  shopifyPolicies: Array<{ title: string; body: string; url?: string }>,
  shopDomain: string
): CachedShopPolicies {
  const policies: CachedShopPolicies = {
    shopName: shopDomain.replace('.myshopify.com', '')
  };

  for (const policy of shopifyPolicies) {
    const titleLower = policy.title.toLowerCase();
    const body = policy.body || null;

    // Map policy titles to our structure
    // Shopify uses: "Refund Policy", "Shipping Policy", "Privacy Policy", "Terms of Service"
    if (titleLower.includes('refund') || titleLower.includes('return')) {
      policies.refundPolicy = body;
    } else if (titleLower.includes('shipping')) {
      policies.shippingPolicy = body;
    } else if (titleLower.includes('privacy')) {
      policies.privacyPolicy = body;
    } else if (titleLower.includes('terms') || titleLower.includes('service')) {
      policies.termsOfService = body;
    }
  }

  return policies;
}

/**
 * Convert cached policies to ShopPolicies format for N8N context
 */
export function toShopPoliciesFormat(cached: CachedShopPolicies | null): ShopPolicies | null {
  if (!cached) return null;

  return {
    shopName: cached.shopName,
    returns: cached.refundPolicy,
    shipping: cached.shippingPolicy,
    privacy: cached.privacyPolicy,
    termsOfService: cached.termsOfService,
    contactEmail: cached.contactEmail
  };
}

/**
 * Clear cached policies for a specific shop
 * Useful when policies are updated
 */
export function clearPolicyCacheForShop(shopDomain: string): void {
  policyCache.delete(shopDomain);
  logger.info({ shop: shopDomain }, 'Cleared policy cache');
}

/**
 * Clear all cached policies
 */
export function clearAllPolicyCache(): void {
  policyCache.clear();
  logger.info('Cleared all policy cache');
}

/**
 * Get cache statistics (for debugging/monitoring)
 */
export function getPolicyCacheStats(): {
  totalEntries: number;
  entries: Array<{ shop: string; ageMs: number }>;
} {
  const entries: Array<{ shop: string; ageMs: number }> = [];
  const now = Date.now();

  policyCache.forEach((entry, shop) => {
    entries.push({
      shop,
      ageMs: now - entry.timestamp
    });
  });

  return {
    totalEntries: policyCache.size,
    entries
  };
}

/**
 * Generate fallback message for a specific policy type based on language
 * Used when the shop has not configured their policies
 */
export function getDefaultPolicyMessage(
  policyType: 'returns' | 'shipping' | 'privacy',
  language: string
): string {
  const messages: Record<string, Record<string, string>> = {
    returns: {
      en: "Return policy information is not configured for this store. Please contact customer support for details about returns and refunds.",
      fr: "La politique de retour n'est pas configurée pour cette boutique. Veuillez contacter le service client pour plus d'informations sur les retours et remboursements.",
      es: "La política de devoluciones no está configurada para esta tienda. Contacte al servicio de atención al cliente para obtener más información.",
      de: "Die Rückgaberichtlinie ist für diesen Shop nicht konfiguriert. Bitte kontaktieren Sie den Kundenservice für weitere Informationen.",
      pt: "A política de devolução não está configurada para esta loja. Entre em contato com o suporte ao cliente para mais informações.",
      it: "La politica di reso non è configurata per questo negozio. Contatta il servizio clienti per maggiori informazioni."
    },
    shipping: {
      en: "Shipping policy information is not configured for this store. Please contact customer support for details about shipping options and delivery times.",
      fr: "La politique de livraison n'est pas configurée pour cette boutique. Veuillez contacter le service client pour plus d'informations sur les options de livraison.",
      es: "La política de envío no está configurada para esta tienda. Contacte al servicio de atención al cliente para obtener más información.",
      de: "Die Versandrichtlinie ist für diesen Shop nicht konfiguriert. Bitte kontaktieren Sie den Kundenservice für weitere Informationen.",
      pt: "A política de envio não está configurada para esta loja. Entre em contato com o suporte ao cliente para mais informações.",
      it: "La politica di spedizione non è configurata per questo negozio. Contatta il servizio clienti per maggiori informazioni."
    },
    privacy: {
      en: "Privacy policy information is not available. Please contact customer support for more details.",
      fr: "La politique de confidentialité n'est pas disponible. Veuillez contacter le service client pour plus d'informations.",
      es: "La política de privacidad no está disponible. Contacte al servicio de atención al cliente para más información.",
      de: "Die Datenschutzrichtlinie ist nicht verfügbar. Bitte kontaktieren Sie den Kundenservice für weitere Informationen.",
      pt: "A política de privacidade não está disponível. Entre em contato com o suporte ao cliente para mais informações.",
      it: "La politica sulla privacy non è disponibile. Contatta il servizio clienti per maggiori informazioni."
    }
  };

  const langCode = language.toLowerCase().split('-')[0] || 'en';
  const policyMessages = messages[policyType];
  if (!policyMessages) return '';
  return policyMessages[langCode] ?? policyMessages['en']!;
}
