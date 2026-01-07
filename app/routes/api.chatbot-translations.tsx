import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSecureCorsHeaders, getAPISecurityHeaders, mergeSecurityHeaders } from "../lib/security-headers.server";

// Import all chatbot translations
import enCommon from "../i18n/locales/en/common.json";
import esCommon from "../i18n/locales/es/common.json";
import frCommon from "../i18n/locales/fr/common.json";
import deCommon from "../i18n/locales/de/common.json";
import jaCommon from "../i18n/locales/ja/common.json";
import itCommon from "../i18n/locales/it/common.json";
import ptCommon from "../i18n/locales/pt/common.json";
import zhCommon from "../i18n/locales/zh/common.json";

const translations = {
  en: enCommon.chatbot,
  es: esCommon.chatbot || enCommon.chatbot, // Fallback to English if not available
  fr: frCommon.chatbot,
  de: deCommon.chatbot || enCommon.chatbot,
  ja: jaCommon.chatbot || enCommon.chatbot,
  it: itCommon.chatbot || enCommon.chatbot,
  pt: ptCommon.chatbot || enCommon.chatbot,
  zh: zhCommon.chatbot || enCommon.chatbot,
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const lang = url.searchParams.get("lang") || "en";

    // Validate language
    const validLangs = ["en", "es", "fr", "de", "ja", "it", "pt", "zh"];
    const selectedLang = validLangs.includes(lang) ? lang : "en";

    // Get translations for selected language
    const chatbotTranslations = translations[selectedLang as keyof typeof translations];

    return json(
      { translations: chatbotTranslations, lang: selectedLang },
      {
        headers: mergeSecurityHeaders(
          getSecureCorsHeaders(request),
          getAPISecurityHeaders()
        )
      }
    );
  } catch (error) {
    console.error("Error loading chatbot translations:", error);

    // Return English translations on error
    return json(
      { translations: translations.en, lang: "en" },
      {
        headers: mergeSecurityHeaders(
          getSecureCorsHeaders(request),
          getAPISecurityHeaders()
        )
      }
    );
  }
};

export async function options() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
