import { Page, expect, test } from '@playwright/test';
import { findRawTranslationKeys, mockWorkFolder, openWorkFolder, setLanguage } from './helpers';

/**
 * E2E i18n checks for the images overview (src/pages/images, namespace
 * `images`, plus shared nav strings from `common`).
 */

/** Collects uncaught page errors; assert the array is empty at the end. */
const collectPageErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(String(error)));
  return errors;
};

/** Boots the app in the given language and lands on the images overview. */
const openImagesOverview = async (page: Page, lang: 'en' | 'ja') => {
  await setLanguage(page, lang);
  await mockWorkFolder(page);
  await page.goto('/');
  await openWorkFolder(page);
};

test.describe('images overview i18n', () => {

  test('ja: renders translated sidebar and header controls', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openImagesOverview(page, 'ja');

    // Navigation sidebar (common.appNavigationSidebar)
    await expect(page.getByRole('link', { name: '画像' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'ワークスペース' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ナレッジグラフ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'データモデル' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'エクスポート' })).toBeVisible();
    await expect(page.getByRole('link', { name: '設定' })).toBeVisible();
    await expect(page.getByRole('button', { name: '終了' })).toBeVisible();

    // Folder header (images.folderHeader / images.common / images.headerControls)
    await expect(page.getByText('フォルダ', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'メタデータ' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'IIIF をインポート' })).toBeVisible();
    await expect(page.getByRole('button', { name: '未アノテーションを非表示' })).toBeVisible();
    // The layout select trigger has no aria-label; グリッド is its content
    await expect(page.getByRole('combobox').filter({ hasText: 'グリッド' })).toBeVisible();
    // Default (unsorted) grid sorting label
    await expect(page.getByText('マニフェスト順')).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('ja: grid sorting menu shows translated options', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openImagesOverview(page, 'ja');

    await expect(page.getByText('マニフェスト順')).toBeVisible({ timeout: 15000 });
    await page.getByText('マニフェスト順').click();

    await expect(page.getByRole('menuitemradio', { name: '名前' })).toBeVisible();
    await expect(page.getByRole('menuitemradio', { name: 'アノテーション' })).toBeVisible();
    await expect(page.getByRole('menuitemradio', { name: '昇順' })).toBeVisible();
    await expect(page.getByRole('menuitemradio', { name: '降順' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);

    await page.keyboard.press('Escape');
    expect(errors).toEqual([]);
  });

  test('ja: switching to table layout shows translated column headers', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openImagesOverview(page, 'ja');

    // Layout select (images.headerControls.grid / .table)
    const layoutSelect = page.getByRole('combobox').filter({ hasText: 'グリッド' });
    await expect(layoutSelect).toBeVisible({ timeout: 15000 });
    await layoutSelect.click();
    await page.getByRole('option', { name: 'テーブル' }).click();

    // Table column headers (images.table)
    await expect(page.getByRole('columnheader', { name: '種類' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '名前' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '寸法' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '最終編集' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'アノテーション' })).toBeVisible();

    // The seeded sample image is listed as a row
    await expect(page.getByRole('row', { name: /sample\.png/ })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('ja: image item context menu shows translated actions', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openImagesOverview(page, 'ja');

    const imageItem = page.locator('.item-grid li', { hasText: 'sample.png' });
    await expect(imageItem).toBeVisible({ timeout: 15000 });
    await imageItem.hover();
    await imageItem.locator('.item-actions-trigger').click();

    // images.common strings in the dropdown
    await expect(page.getByRole('menuitem', { name: 'メタデータ' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: '画像を開く' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'ワークスペースに追加' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);

    await page.keyboard.press('Escape');
    expect(errors).toEqual([]);
  });

  test('en: spot-checks translated overview strings', async ({ page }) => {
    const errors = collectPageErrors(page);
    await openImagesOverview(page, 'en');

    await expect(page.getByRole('link', { name: 'Images' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('link', { name: 'Knowledge Graph' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hide unannotated' })).toBeVisible();
    await expect(page.getByRole('combobox').filter({ hasText: 'Grid' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Import IIIF' })).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

});
