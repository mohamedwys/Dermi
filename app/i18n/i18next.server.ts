import { RemixI18Next } from "remix-i18next/server";
import i18nConfig from "./index";
import { resources } from "./resources";

// Create RemixI18Next instance with bundled resources and simplified detection
const i18nServer = new RemixI18Next({
  detection: {
    supportedLanguages: i18nConfig.supportedLngs,
    fallbackLanguage: i18nConfig.fallbackLng,
    // Disable cookie detection to avoid cookie.parse issues
    // We'll handle this manually in loaders
    order: ["searchParams"],
  },
  // i18next configuration
  i18next: {
    ...i18nConfig,
    // Provide resources directly for serverless compatibility
    resources,
  },
});

/**
 * Get locale from request with manual cookie parsing
 * Bypasses remix-i18next cookie detection to avoid dependency issues
 */
export async function getLocaleFromRequest(request: Request): Promise<string> {
  try {
    console.log('[getLocaleFromRequest] Starting locale detection...');

    // --- 1️⃣ Read cookie first ---
    const cookieHeader = request.headers.get("Cookie") ?? "";
    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((c) => {
      const [key, ...vals] = c.trim().split("=");
      if (!key) return;
      cookies[key] = decodeURIComponent(vals.join("="));
    });

    console.log('[getLocaleFromRequest] Parsed cookies:', cookies);

    const localeCookie = cookies["locale"];
    if (localeCookie && i18nConfig.supportedLngs.includes(localeCookie)) {
      console.log('[getLocaleFromRequest] ✅ Using locale from cookie:', localeCookie);
      return localeCookie;
    }

    console.log('[getLocaleFromRequest] No valid locale cookie found');

    // --- 2️⃣ Fallback to URL search param ---
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    if (localeParam && i18nConfig.supportedLngs.includes(localeParam)) {
      console.log('[getLocaleFromRequest] ✅ Using locale from URL:', localeParam);
      return localeParam;
    }

    // --- 3️⃣ Fallback to default ---
    console.log('[getLocaleFromRequest] ⚠️ Using fallback locale:', i18nConfig.fallbackLng);
    return i18nConfig.fallbackLng;

  } catch (error) {
    console.error("[getLocaleFromRequest] ❌ Error getting locale:", error);
    return i18nConfig.fallbackLng;
  }
}

export default i18nServer;
