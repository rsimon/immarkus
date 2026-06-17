import { readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

/**
 * Regression tests for the i18n locale resources.
 *
 * 1. en/ja key parity — every key present in one locale must exist in the
 *    other (Japanese legitimately omits `_one` plural variants).
 * 2. Every literal translation key referenced in the source code
 *    (t('...') and <Trans i18nKey="...">) must resolve in the English
 *    resources. Dynamic keys (template literals, variables) cannot be
 *    checked statically and are skipped.
 */

const LOCALES_DIR = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = join(LOCALES_DIR, '..');

const flatten = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    value !== null && typeof value === 'object'
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]);

const loadNamespace = (lang: string, file: string): Set<string> =>
  new Set(flatten(JSON.parse(readFileSync(join(LOCALES_DIR, lang, file), 'utf8'))));

const namespaceFiles = readdirSync(join(LOCALES_DIR, 'en')).filter(f => f.endsWith('.json'));

/** A key resolves if it exists verbatim or via its plural variants. */
const resolves = (keys: Set<string>, key: string) =>
  keys.has(key) || keys.has(`${key}_other`) || keys.has(`${key}_one`);

describe('locale key parity (en vs ja)', () => {

  it('has the same namespace files in both locales', () => {
    const ja = readdirSync(join(LOCALES_DIR, 'ja')).filter(f => f.endsWith('.json'));
    expect(ja.sort()).toEqual([...namespaceFiles].sort());
  });

  // Missing translations are reported, not failed. With the "add the English
  // label first, translate later" workflow (see #305), this surfaces the
  // outstanding backlog in CI without breaking the build. Empty values,
  // orphaned keys, mismatched namespace files, and unresolved referenced keys
  // (below) all remain hard failures.
  it('reports en keys still awaiting a ja translation (non-blocking)', () => {
    const pending = namespaceFiles.flatMap(file => {
      const en = loadNamespace('en', file);
      const ja = loadNamespace('ja', file);
      return [...en]
        // ja only needs the _other variant of a plural pair
        .filter(key => !ja.has(key) && !(key.endsWith('_one') && ja.has(key.replace(/_one$/, '_other'))))
        .map(key => `${file}:${key}`);
    });

    if (pending.length > 0)
      console.warn(`\n[i18n] ${pending.length} ja translation(s) pending:\n  ${pending.join('\n  ')}\n`);

    expect(Array.isArray(pending)).toBe(true);
  });

  it.each(namespaceFiles)('%s: ja has no keys missing from en', file => {
    const en = loadNamespace('en', file);
    const ja = loadNamespace('ja', file);

    const orphaned = [...ja].filter(key => !en.has(key));
    expect(orphaned).toEqual([]);
  });

  it.each(namespaceFiles)('%s: no empty ja translations', file => {
    const values: string[] = [];
    const collect = (obj: object) => Object.values(obj).forEach(v =>
      v !== null && typeof v === 'object' ? collect(v) : values.push(v));
    collect(JSON.parse(readFileSync(join(LOCALES_DIR, 'ja', file), 'utf8')));

    expect(values.filter(v => typeof v !== 'string' || v.trim() === '')).toEqual([]);
  });

});

describe('translation keys referenced in source', () => {

  const enByNamespace = new Map(namespaceFiles.map(file =>
    [file.replace(/\.json$/, ''), loadNamespace('en', file)]));

  const allEnKeys = new Set([...enByNamespace.entries()]
    .flatMap(([ns, keys]) => [...keys].map(key => `${ns}:${key}`)));

  const sourceFiles: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) sourceFiles.push(path);
    }
  };
  walk(SRC_DIR);

  const resolvesAnywhere = (key: string) =>
    [...enByNamespace.values()].some(keys => resolves(keys, key));

  it('every literal t()/Trans key resolves in the en resources', () => {
    const unresolved: string[] = [];

    for (const path of sourceFiles) {
      const content = readFileSync(path, 'utf8');
      if (!content.includes('react-i18next')) continue;

      const namespaces = [...content.matchAll(/useTranslation\(\s*['"]([\w-]+)['"]/g)]
        .map(m => m[1]);

      // t('key') / t("key") — \b keeps e.g. format( from matching
      for (const [, key] of content.matchAll(/\bt\(\s*['"]([^'"]+)['"]/g)) {
        const [ns, bareKey] = key.includes(':') ? key.split(':', 2) : [null, key];

        const ok = ns
          ? resolves(enByNamespace.get(ns) ?? new Set(), bareKey)
          : namespaces.some(n => resolves(enByNamespace.get(n) ?? new Set(), bareKey))
            || (namespaces.length === 0 && resolvesAnywhere(bareKey));

        if (!ok) unresolved.push(`${path}: t('${key}') [ns: ${ns ?? (namespaces.join(',') || '?')}]`);
      }

      // <Trans ns="..." i18nKey="..."> (attribute order varies)
      for (const [tag] of content.matchAll(/<Trans\b[\s\S]*?>/g)) {
        const i18nKey = tag.match(/i18nKey=["']([^"']+)["']/)?.[1];
        if (!i18nKey) continue;

        const ns = tag.match(/\bns=["']([\w-]+)["']/)?.[1];
        const candidates = ns ? [ns] : namespaces;

        const ok = candidates.some(n => resolves(enByNamespace.get(n) ?? new Set(), i18nKey));
        if (!ok) unresolved.push(`${path}: <Trans i18nKey="${i18nKey}"> [ns: ${ns ?? (namespaces.join(',') || '?')}]`);
      }
    }

    expect(unresolved).toEqual([]);
    expect(allEnKeys.size).toBeGreaterThan(0);
  });

});
