// app/translations/i18next.server.ts
import { createCookie } from "@remix-run/node";
import i18nConfig from "./index";

// Create a cookie for storing the user's locale
export const localeCookie = createCookie("locale", {
  path: "/",
  httpOnly: false, // allow access from client-side if needed
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 365, // 1 year
});

/**
 * Get the locale from the request in the following order:
 * 1. Cookie
 * 2. URL query parameter
 * 3. Fallback locale
 */
export async function getLocaleFromRequest(request: Request): Promise<string> {
  try {
    // 1️⃣ Check cookie
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const cookieValue = await localeCookie.parse(cookieHeader);
      if (cookieValue && i18nConfig.supportedLngs.includes(cookieValue)) {
        return cookieValue;
      }
    }

    // 2️⃣ Check URL query parameter
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");
    if (localeParam && i18nConfig.supportedLngs.includes(localeParam)) {
      return localeParam;
    }
  } catch (error) {
    console.error("Error parsing locale from request:", error);
  }

  // 3️⃣ Fallback locale
  return i18nConfig.fallbackLng;
}
