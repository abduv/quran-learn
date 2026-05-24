import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import kk from "./kk.json";
import ru from "./ru.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      kk: { translation: kk },
      ru: { translation: ru },
    },
    fallbackLng: "kk",
    supportedLngs: ["kk", "ru"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "lang",
      caches: ["localStorage"],
    },
  });

export default i18n;
