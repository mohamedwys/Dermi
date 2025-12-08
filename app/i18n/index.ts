// Centralized i18n configuration for both server and client
const i18nConfig = {
  // Supported languages
  supportedLngs: ["en", "es", "fr", "de", "ja", "it", "pt", "zh"],
  // Fallback language
  fallbackLng: "en",
  // Default namespace
  defaultNS: "common",
  // Disable suspense for Remix
  react: { useSuspense: false },
};

export default i18nConfig;
