import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from '../locales/en/common.json';
import enStart from '../locales/en/start.json';
import enUi from '../locales/en/ui.json';

import jaCommon from '../locales/ja/common.json';
import jaStart from '../locales/ja/start.json';
import jaUi from '../locales/ja/ui.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        start: enStart,
        ui: enUi
      },
      ja: {
        common: jaCommon,
        start: jaStart,
        ui: jaUi
      }
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
