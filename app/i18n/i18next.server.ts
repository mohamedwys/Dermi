// app/translations/i18next.server.ts
import { createCookie } from "@remix-run/node";
import i18nConfig from "./index"; // still needed

export const localeCookie = createCookie("locale", {
  path: "/",
  httpOnly: false,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 365,
});

export async function getLocaleFromRequest(request: Request): Promise<string> {
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookieValue = await localeCookie.parse(cookieHeader);
    if (cookieValue && i18nConfig.supportedLngs.includes(cookieValue)) {
      return cookieValue;
    }
  }

  const url = new URL(request.url);
  const localeParam = url.searchParams.get("locale");
  if (localeParam && i18nConfig.supportedLngs.includes(localeParam)) {
    return localeParam;
  }

  return i18nConfig.fallbackLng;
}
