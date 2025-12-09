import { createCookie } from "@remix-run/node";
import i18nConfig from "./index";

// Cookie used to store locale
export const localeCookie = createCookie("locale", {
  path: "/",
  httpOnly: false,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 365,
});

export async function getLocaleFromRequest(request: Request): Promise<string> {
  try {
    // 1️⃣ Try cookie
    const cookieHeader = request.headers.get("Cookie");
    if (cookieHeader) {
      const cookieValue = await localeCookie.parse(cookieHeader);

      if (
        typeof cookieValue === "string" &&
        i18nConfig.supportedLngs.includes(cookieValue)
      ) {
        return cookieValue;
      }
    }

    // 2️⃣ Try URL parameter ?locale=fr
    const url = new URL(request.url);
    const localeParam = url.searchParams.get("locale");

    if (
      typeof localeParam === "string" &&
      i18nConfig.supportedLngs.includes(localeParam)
    ) {
      return localeParam;
    }
  } catch (error) {
    console.error("[i18next.server] Error reading locale:", error);
  }

  // 3️⃣ Safe fallback (handles both string & object formats)
  let fallback = "en";

  if (typeof i18nConfig.fallbackLng === "string") {
    fallback = i18nConfig.fallbackLng;
  } else if (
    i18nConfig.fallbackLng &&
    typeof i18nConfig.fallbackLng === "object" &&
    "default" in i18nConfig.fallbackLng
  ) {
    fallback = (i18nConfig.fallbackLng as { default: string }).default;
  }

  return fallback;
}
