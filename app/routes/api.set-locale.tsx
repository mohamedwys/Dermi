// app/routes/api.set-locale.tsx
import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { localeCookie } from "../i18n/i18next.server";
import i18nConfig from "../i18n";
import { logger } from "../lib/logger.server";

/**
 * Resource route for setting user's locale preference via cookie.
 * Returns JSON (no UI rendering) to avoid iframe session issues.
 *
 * Usage from client:
 * ```ts
 * await fetch('/api/set-locale', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ locale: 'es' })
 * });
 * window.location.reload(); // Reload to apply new locale
 * ```
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    let locale: string | undefined;

    // Support both JSON and FormData
    const contentType = request.headers.get("Content-Type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      locale = body.locale;
    } else {
      const formData = await request.formData();
      locale = formData.get("locale")?.toString();
    }

    logger.debug({ locale }, 'Received locale change request');

    if (!locale || !i18nConfig.supportedLngs.includes(locale)) {
      logger.warn({ locale, supportedLngs: i18nConfig.supportedLngs }, 'Invalid locale requested');
      return json(
        { success: false, error: "Invalid locale" },
        { status: 400 }
      );
    }

    logger.info({ locale }, 'Setting locale cookie');

    // Return success with Set-Cookie header (no redirect)
    return json(
      { success: true, locale },
      {
        headers: {
          "Set-Cookie": await localeCookie.serialize(locale),
        },
      }
    );
  } catch (error) {
    logger.error({ err: error }, 'Error setting locale cookie');
    return json(
      { success: false, error: "Internal error" },
      { status: 500 }
    );
  }
}

// No default export - this is a resource route that only returns JSON