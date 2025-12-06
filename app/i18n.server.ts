import { RemixI18Next } from "remix-i18next/server";
import i18n from "./i18n";

export default new RemixI18Next({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
  },
  // The i18next configuration will be loaded from ./i18n.ts
  i18next: {
    ...i18n,
  },
});
