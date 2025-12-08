// app/i18n/i18next.server.ts
import { RemixI18Next } from "remix-i18next/server";
import { createCookie } from "@remix-run/node";
import i18nConfig from "./index";
import { resources } from "./resources";

// Cookie to persist locale
export const localeCookie = createCookie("locale", {
  path: "/",
  httpOnly: false, // allow client to read
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 365, // 1 year
});

// Detect locale from request
export async function getLocaleFromRequest(request: Request): Promise<string> {
  // 1️⃣ Try cookie
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookieValue = await localeCookie.parse(cookieHeader);
    if (cookieValue && i18nConfig.supportedLngs.includes(cookieValue)) {
      return cookieValue;
    }
  }

  // 2️⃣ Try URL search param
  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  if (localeParam && i18nConfig.supportedLngs.includes(localeParam)) {
    return localeParam;
  }

  // 3️⃣ Default fallback
  return i18nConfig.fallbackLng;
}

// Remix i18next server instance
const i18nServer = new RemixI18Next({
  detection: {
    supportedLanguages: i18nConfig.supportedLngs,
    fallbackLanguage: i18nConfig.fallbackLng,
    order: ["searchParams"], // cookies handled manually
  },
  i18next: {
    ...i18nConfig,
    resources,
  },
});

export default i18nServer;
