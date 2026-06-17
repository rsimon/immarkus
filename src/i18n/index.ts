import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }
];

// English ships in the main bundle and is the always-available fallback, so
// the first paint never waits on a network/chunk load.
const enModules = import.meta.glob('../locales/en/*.json', { eager: true });

const en: Record<string, any> = {};
for (const path in enModules) {
  const ns = path.split('/').pop()!.replace('.json', '');
  en[ns] = (enModules[path] as any).default;
}

// Each non-English locale file becomes its own lazy chunk, fetched on demand
// (and cached) when the user selects that language, instead of being baked into
// the main bundle. English is excluded here because it is bundled eagerly
// above. Adding a language or namespace is just dropping the JSON file in — no
// wiring needed here.
const localeModules = import.meta.glob([
  '../locales/*/*.json',
  '!../locales/en/*.json'
]);

i18n
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) => {
    const load = localeModules[`../locales/${language}/${namespace}.json`];
    if (!load) return Promise.reject(new Error(`Unknown locale resource: ${language}/${namespace}`));
    return load().then((mod: any) => mod.default);
  }))
  .use(initReactI18next)
  .init({
    // English is bundled; other languages come from the backend above.
    resources: { en },
    partialBundledLanguages: true,
    ns: Object.keys(en),
    fallbackLng: 'en',
    interpolation: {
      // React already escapes interpolated values
      escapeValue: false
    },
    react: {
      // No Suspense boundary in the tree: while a language loads, components
      // render the English fallback and re-render once the chunk arrives.
      useSuspense: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'immarkus.language'
    }
  });

export default i18n;
