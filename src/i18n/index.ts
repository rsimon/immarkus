import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAnnotate from '../locales/en/annotate.json';
import enCommon from '../locales/en/common.json';
import enImages from '../locales/en/images.json';
import enKnowledgegraph from '../locales/en/knowledgegraph.json';
import enSmartTools from '../locales/en/smartTools.json';
import enStart from '../locales/en/start.json';
import enUi from '../locales/en/ui.json';

import jaAnnotate from '../locales/ja/annotate.json';
import jaCommon from '../locales/ja/common.json';
import jaImages from '../locales/ja/images.json';
import jaKnowledgegraph from '../locales/ja/knowledgegraph.json';
import jaSmartTools from '../locales/ja/smartTools.json';
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
        annotate: enAnnotate,
        common: enCommon,
        images: enImages,
        knowledgegraph: enKnowledgegraph,
        smartTools: enSmartTools,
        start: enStart,
        ui: enUi
      },
      ja: {
        annotate: jaAnnotate,
        common: jaCommon,
        images: jaImages,
        knowledgegraph: jaKnowledgegraph,
        smartTools: jaSmartTools,
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
