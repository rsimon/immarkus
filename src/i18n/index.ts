import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enStart from '../locales/en/start.json';
import jaStart from '../locales/ja/start.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { start: enStart },
      ja: { start: jaStart }
    },
    fallbackLng: 'en',
    interpolation: {
      // React already escapes interpolated values
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'immarkus.language'
    }
  });

export default i18n;
