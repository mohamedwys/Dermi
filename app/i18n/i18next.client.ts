// app/i18n/i18next.client.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import i18nConfig from "./index";
import { resources } from "./resources";

i18n.use(initReactI18next).init({
  ...i18nConfig,
  resources,
  fallbackLng: i18nConfig.fallbackLng,
});

export default i18n;
