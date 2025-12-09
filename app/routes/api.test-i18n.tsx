import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

/**
 * Test endpoint to verify i18n resources are loading correctly
 * Access at: /api/test-i18n
 */
export async function loader({ request }: LoaderFunctionArgs) {
  console.log("🧪 [test-i18n] Test endpoint called");

  try {
    // Import resources
    console.log("🔄 [test-i18n] Importing resources...");
    const resourcesModule = await import("../i18n/resources");
    const resources = resourcesModule.resources;
    console.log("✅ [test-i18n] Resources imported successfully");

    // Import locale detection
    console.log("🔄 [test-i18n] Importing i18n functions...");
    const i18nModule = await import("../i18n/i18next.server");

    if (!("getLocaleFromRequest" in i18nModule)) {
      throw new Error(
        "getLocaleFromRequest is missing from i18next.server.ts (expected export)."
      );
    }

    const { getLocaleFromRequest } = i18nModule;
    console.log("✅ [test-i18n] i18n functions imported successfully");

    // Detect locale
    console.log("🔄 [test-i18n] Getting locale...");
    const locale = await getLocaleFromRequest(request);
    console.log("✅ [test-i18n] Locale detected:", locale);

    // Check resources
    const availableLanguages = Object.keys(resources);
    const hasEnglish = "en" in resources;
    const englishKeys = hasEnglish
      ? Object.keys(resources.en.common).slice(0, 5)
      : [];

    return json({
      success: true,
      locale,
      availableLanguages,
      hasEnglish,
      sampleEnglishKeys: englishKeys,
      resourcesType: typeof resources,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const e = error as Error;
    console.error("❌ [test-i18n] Error:", e);

    return json(
      {
        success: false,
        error: {
          message: e.message,
          stack: e.stack,
          name: e.name,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
