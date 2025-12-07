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
    // Try to get from URL searchParams first
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    if (localeParam && i18nConfig.supportedLngs.includes(localeParam)) {
      return localeParam;
    }

    // Manual cookie parsing (simple implementation)
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const localeCookie = cookies["locale"];
      if (localeCookie && i18nConfig.supportedLngs.includes(localeCookie)) {
        return localeCookie;
      }
    }

    // Fallback to default
    return i18nConfig.fallbackLng;
  } catch (error) {
    console.error("[i18next.server] Error getting locale:", error);
    return i18nConfig.fallbackLng;
  }
}

export default i18nServer;
