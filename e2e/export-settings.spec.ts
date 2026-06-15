import { Page, expect, test } from '@playwright/test';
import { findRawTranslationKeys, mockWorkFolder, openWorkFolder, setLanguage } from './helpers';

/**
 * i18n coverage for the EXPORT (ns `export`) and SETTINGS (ns `settings`)
 * pages, both rebased on their upstream refactors (NavTabItem; the tabbed
 * General / Visual Search settings, where the language switcher now lives
 * on the General tab).
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

const gotoExport = async (page: Page, lang: 'en' | 'ja') => {
  await page.getByRole('link', { name: lang === 'ja' ? 'エクスポート' : 'Export' }).click();
  await page.waitForURL(/#\/export\/annotations/);
};

const gotoSettings = async (page: Page, lang: 'en' | 'ja') => {
  await page.getByRole('link', { name: lang === 'ja' ? '設定' : 'Settings', exact: true }).click();
  await page.waitForURL(/#\/settings\/general/);
};

test.describe('export page', () => {

  test('shows localized title, nav and sections (ja)', async ({ page }) => {
    const errors = await boot(page, 'ja');
    await gotoExport(page, 'ja');

    const main = page.locator('main');
    await expect(main.getByRole('heading', { name: 'エクスポート' })).toBeVisible();
    await expect(main.getByText('データをさまざまな形式でエクスポートできます。')).toBeVisible();

    await expect(main.getByRole('link', { name: 'アノテーション' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'リレーション' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'データモデル' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'メタデータ' })).toBeVisible();

    await expect(main.getByRole('heading', { name: 'アノテーションデータ' })).toBeVisible();

    // Navigate to the data-model export section
    await main.getByRole('link', { name: 'データモデル' }).click();
    await page.waitForURL(/#\/export\/model/);
    await expect(main.getByRole('heading', { name: 'IMMARKUS データモデル全体' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('spot checks in English', async ({ page }) => {
    const errors = await boot(page, 'en');
    await gotoExport(page, 'en');

    const main = page.locator('main');
    await expect(main.getByRole('heading', { name: 'Export' })).toBeVisible();
    await expect(main.getByText('Export your data in different export formats.')).toBeVisible();
    await expect(main.getByRole('link', { name: 'Annotations' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Metadata' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

});

test.describe('settings page', () => {

  test('General tab (default) is localized (ja)', async ({ page }) => {
    const errors = await boot(page, 'ja');
    await gotoSettings(page, 'ja');

    await expect(page.getByRole('heading', { name: '設定', exact: true })).toBeVisible();
    await expect(page.getByText('アプリケーション全体の設定です。')).toBeVisible();

    // Tab nav
    await expect(page.locator('main aside nav').getByText('一般', { exact: true })).toBeVisible();
    await expect(page.locator('main aside nav').getByText('ビジュアル検索', { exact: true })).toBeVisible();

    // General tab content (the language switcher itself is maintainer-owned;
    // we only assert the surrounding labels are translated)
    await expect(page.getByRole('heading', { name: '一般設定' })).toBeVisible();
    await expect(page.getByText('アプリケーションとユーザーインターフェイスの全般的な設定です。')).toBeVisible();
    await expect(page.getByText('ユーザーインターフェイスの表示言語です。')).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('General tab (default) is localized (en)', async ({ page }) => {
    const errors = await boot(page, 'en');
    await gotoSettings(page, 'en');

    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'General Settings' })).toBeVisible();
    await expect(page.getByText('The user interface language.')).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('Visual Search tab shows the NoIndex state (ja)', async ({ page }) => {
    const errors = await boot(page, 'ja');
    await gotoSettings(page, 'ja');

    await page.locator('main aside nav').getByText('ビジュアル検索', { exact: true }).click();
    await page.waitForURL(/#\/settings\/visual-search/);

    // Freshly mocked folder has no index → NoIndex block (one seeded image)
    await expect(
      page.getByRole('button', { name: '1 件の画像のインデックスを開始' })
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('ビジュアル検索を使う前に、画像のインデックス作成が必要です。')).toBeVisible();
    await expect(page.getByText('画像が外部サービスにアップロードされることはありません')).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

});
