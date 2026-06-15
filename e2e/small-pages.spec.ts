import { Page, expect, test } from '@playwright/test';
import { findRawTranslationKeys, mockWorkFolder, openWorkFolder, setLanguage } from './helpers';

/**
 * i18n coverage for the smaller content pages: DATA MODEL (ns `datamodel`),
 * ABOUT (ns `about`) and X-MARKUS (ns `markus`).
 *
 * (The Export and Settings pages were refactored upstream after this work
 * began and are translated in a separate PR rebased on those changes.)
 *
 * All routes live behind the work-folder gate (src/App.tsx renders <Start>
 * until a store exists), so each test opens the mocked work folder first and
 * navigates via the already-translated sidebar — no reloads, so the
 * addInitScript/setLanguage gotcha never bites.
 */

test.describe.configure({ timeout: 90_000 });

const boot = async (page: Page, lang: 'en' | 'ja'): Promise<string[]> => {
  const pageErrors: string[] = [];
  page.on('pageerror', err => pageErrors.push(String(err)));

  await setLanguage(page, lang);
  await mockWorkFolder(page);
  await page.goto('/');
  await openWorkFolder(page);

  return pageErrors;
};

/**
 * About / X-MARKUS render real URLs as link texts (immarkus.xmarkus.org,
 * doi.org/...) which the dotted-word heuristic can't tell from raw keys.
 * Anything inside an <a> is a URL by design, so subtract link texts first.
 */
const expectNoRawKeys = async (page: Page) => {
  const candidates = await findRawTranslationKeys(page);
  if (candidates.length === 0) {
    expect(candidates).toEqual([]);
    return;
  }
  const linkTexts = (await page.locator('a').allInnerTexts()).join('\n');
  expect(candidates.filter(c => !linkTexts.includes(c))).toEqual([]);
};

const gotoDataModel = async (page: Page, lang: 'en' | 'ja') => {
  await page.getByRole('link', { name: lang === 'ja' ? 'データモデル' : 'Data Model' }).click();
  await page.waitForURL(/#\/model/);
};

test.describe('data model page', () => {

  test('shows localized title, tabs and entity classes tab (ja)', async ({ page }) => {
    const errors = await boot(page, 'ja');
    await gotoDataModel(page, 'ja');

    await expect(page.getByRole('heading', { name: 'データモデル' })).toBeVisible();

    await expect(page.getByRole('tab', { name: 'エンティティクラス' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'リレーション' })).toBeVisible();
    await expect(page.getByRole('tab', { name: '画像メタデータ' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'フォルダメタデータ' })).toBeVisible();

    await expect(page.getByText('エンティティクラスがありません')).toBeVisible();
    await expect(page.getByRole('button', { name: '新規エンティティクラスを作成' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'モデルをインポート' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('relationships tab shows localized headers and empty state (ja)', async ({ page }) => {
    const errors = await boot(page, 'ja');
    await gotoDataModel(page, 'ja');

    await page.getByRole('tab', { name: 'リレーション' }).click();

    await expect(page.getByRole('columnheader', { name: 'リレーション名' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ソースクラス' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'ターゲットクラス' })).toBeVisible();
    await expect(page.getByText('リレーションタイプが定義されていません')).toBeVisible();
    await expect(page.getByRole('button', { name: 'リレーションタイプを追加' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('image and folder metadata tabs show localized texts (ja)', async ({ page }) => {
    const errors = await boot(page, 'ja');
    await gotoDataModel(page, 'ja');

    await page.getByRole('tab', { name: '画像メタデータ' }).click();
    await expect(page.getByRole('button', { name: '新規画像スキーマ' })).toBeVisible();
    expect(await findRawTranslationKeys(page)).toEqual([]);

    await page.getByRole('tab', { name: 'フォルダメタデータ' }).click();
    await expect(page.getByRole('button', { name: '新規フォルダスキーマ' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('entity class editor dialog is localized (ja)', async ({ page }) => {
    const errors = await boot(page, 'ja');
    await gotoDataModel(page, 'ja');

    await page.getByRole('button', { name: '新規エンティティクラスを作成' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('表示名')).toBeVisible();
    await expect(dialog.getByText('親クラス')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'エンティティクラスを保存' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('spot checks in English', async ({ page }) => {
    const errors = await boot(page, 'en');
    await gotoDataModel(page, 'en');

    await expect(page.getByRole('heading', { name: 'Data Model' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Entity Classes' })).toBeVisible();
    await expect(page.getByText('No entity classes')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create New Entity Class' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

});

test.describe('about page', () => {

  test('renders Japanese title, prose and image alt texts', async ({ page }) => {
    const pageErrors = await boot(page, 'ja');

    await page.getByRole('link', { name: 'IMMARKUS', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'IMMARKUS について' })).toBeVisible();

    await expect(page.getByText('によって開発されました')).toBeVisible();
    await expect(page.getByText('プラットフォーム', { exact: true })).toBeVisible();
    await expect(page.getByText('コード', { exact: true })).toBeVisible();
    await expect(page.getByText('利用手順', { exact: true })).toBeVisible();

    await expect(page.getByAltText('KU Leuven のロゴ')).toBeVisible();
    await expect(page.getByAltText('欧州研究会議 (ERC) のロゴ')).toBeVisible();

    // Citations and the ERC funding statement stay in their original
    // language BY DESIGN — assert they are still present, untranslated.
    await expect(page.getByText('European Research Council (ERC) under the European Union')).toBeVisible();

    await expectNoRawKeys(page);
    expect(pageErrors).toEqual([]);
  });

  test('renders English title and citation labels', async ({ page }) => {
    const pageErrors = await boot(page, 'en');

    await page.getByRole('link', { name: 'IMMARKUS', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'About IMMARKUS' })).toBeVisible();

    await expect(page.getByText('has been developed by Prof. Dr. Hilde De Weerdt')).toBeVisible();
    await expect(page.getByText('Platform', { exact: true })).toBeVisible();
    await expect(page.getByAltText('KU Leuven logo')).toBeVisible();

    await expectNoRawKeys(page);
    expect(pageErrors).toEqual([]);
  });

});

test.describe('x-markus page', () => {

  test('renders Japanese intro/materials, keeps X-MARKUS heading verbatim', async ({ page }) => {
    const pageErrors = await boot(page, 'ja');

    await page.getByRole('link', { name: 'X-MARKUS', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'X-MARKUS', exact: true })).toBeVisible();

    await expect(page.getByText('クロスメディアアノテーション環境 X-MARKUS の一部です')).toBeVisible();
    await expect(page.getByText('各プラットフォームには解説資料が用意されています')).toBeVisible();

    await expectNoRawKeys(page);
    expect(pageErrors).toEqual([]);
  });

  test('renders English intro/materials', async ({ page }) => {
    const pageErrors = await boot(page, 'en');

    await page.getByRole('link', { name: 'X-MARKUS', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'X-MARKUS', exact: true })).toBeVisible();

    await expect(page.getByText('a cross-media annotation environment consisting of:')).toBeVisible();
    await expect(page.getByText('All platforms feature instructional materials')).toBeVisible();

    await expectNoRawKeys(page);
    expect(pageErrors).toEqual([]);
  });

});
