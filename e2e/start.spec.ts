import { expect, test } from '@playwright/test';
import { findRawTranslationKeys, mockWorkFolder, openWorkFolder, setLanguage } from './helpers';

test.describe('start page', () => {

  test('renders English by default', async ({ page }) => {
    await setLanguage(page, 'en');
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome to IMMARKUS' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open New Folder' })).toBeVisible();
    expect(await findRawTranslationKeys(page)).toEqual([]);
  });

  test('renders Japanese when selected', async ({ page }) => {
    await setLanguage(page, 'ja');
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'IMMARKUS へようこそ' })).toBeVisible();
    await expect(page.getByRole('button', { name: '新しいフォルダを開く' })).toBeVisible();
    expect(await findRawTranslationKeys(page)).toEqual([]);
  });

  test('language switcher toggles and persists across reload', async ({ page }) => {
    // No setLanguage here: addInitScript re-runs on reload and would
    // overwrite the choice made through the UI. Playwright's default
    // locale is en-US, so the app boots in English.
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Welcome to IMMARKUS' })).toBeVisible();

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: '日本語' }).click();
    await expect(page.getByRole('heading', { name: 'IMMARKUS へようこそ' })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'IMMARKUS へようこそ' })).toBeVisible();
  });

  test('opens a work folder and lands in the translated app shell', async ({ page }) => {
    await setLanguage(page, 'ja');
    await mockWorkFolder(page);
    await page.goto('/');
    await openWorkFolder(page);

    // Navigation sidebar localized
    await expect(page.getByText('画像', { exact: true }).first()).toBeVisible({ timeout: 15000 });
    expect(await findRawTranslationKeys(page)).toEqual([]);
  });

});
