import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import id from "./id.json";

const savedLang = typeof window !== "undefined" ? localStorage.getItem("nabcex-lang") || "en" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    id: { translation: id },
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
