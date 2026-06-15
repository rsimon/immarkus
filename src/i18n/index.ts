import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAbout from '../locales/en/about.json';
import enAnnotate from '../locales/en/annotate.json';
import enApp from '../locales/en/app.json';
import enCommon from '../locales/en/common.json';
import enDatamodel from '../locales/en/datamodel.json';
import enExport from '../locales/en/export.json';
import enImages from '../locales/en/images.json';
import enKnowledgegraph from '../locales/en/knowledgegraph.json';
import enMarkus from '../locales/en/markus.json';
import enSettings from '../locales/en/settings.json';
import enSmartTools from '../locales/en/smartTools.json';
import enStart from '../locales/en/start.json';
import enUi from '../locales/en/ui.json';

import jaAbout from '../locales/ja/about.json';
import jaAnnotate from '../locales/ja/annotate.json';
import jaApp from '../locales/ja/app.json';
import jaCommon from '../locales/ja/common.json';
import jaDatamodel from '../locales/ja/datamodel.json';
import jaExport from '../locales/ja/export.json';
import jaImages from '../locales/ja/images.json';
import jaKnowledgegraph from '../locales/ja/knowledgegraph.json';
import jaMarkus from '../locales/ja/markus.json';
import jaSettings from '../locales/ja/settings.json';
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
        about: enAbout,
        annotate: enAnnotate,
        app: enApp,
        common: enCommon,
        datamodel: enDatamodel,
        export: enExport,
        images: enImages,
        knowledgegraph: enKnowledgegraph,
        markus: enMarkus,
        settings: enSettings,
        smartTools: enSmartTools,
        start: enStart,
        ui: enUi
      },
      ja: {
        about: jaAbout,
        annotate: jaAnnotate,
        app: jaApp,
        common: jaCommon,
        datamodel: jaDatamodel,
        export: jaExport,
        images: jaImages,
        knowledgegraph: jaKnowledgegraph,
        markus: jaMarkus,
        settings: jaSettings,
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
