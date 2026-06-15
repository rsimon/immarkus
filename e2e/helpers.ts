import { Page } from '@playwright/test';

/**
 * IMMARKUS requires picking a work folder via the File System Access API,
 * which opens a native dialog Playwright cannot drive. This helper replaces
 * window.showDirectoryPicker with an OPFS-backed directory (no dialog), and
 * seeds it with one small PNG so image-dependent pages have content.
 *
 * Must be called BEFORE page.goto().
 */
export const mockWorkFolder = (page: Page) =>
  page.addInitScript(async () => {
    (window as any).showDirectoryPicker = async () => {
      const root = await navigator.storage.getDirectory();
      const dir = await root.getDirectoryHandle('e2e-work-folder', { create: true });

      // Seed a sample image (idempotent)
      let exists = true;
      try { await dir.getFileHandle('sample.png'); } catch { exists = false; }
      if (!exists) {
        const canvas = new OffscreenCanvas(200, 150);
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(0, 0, 200, 150);
        const blob = await canvas.convertToBlob({ type: 'image/png' });
        const file = await dir.getFileHandle('sample.png', { create: true });
        const writable = await (file as any).createWritable();
        await writable.write(blob);
        await writable.close();
      }

      // The app calls requestPermission() on handles restored from IndexedDB
      (dir as any).requestPermission = async () => 'granted';
      return dir;
    };
  });

/** Force the UI language before the app boots (mirrors the detector's cache). */
export const setLanguage = (page: Page, lang: 'en' | 'ja') =>
  page.addInitScript(l => localStorage.setItem('immarkus.language', l), lang);

/**
 * Open the mocked work folder from the start page and wait for the app to
 * land on the images overview.
 */
export const openWorkFolder = async (page: Page) => {
  await page.getByRole('button').first().waitFor();
  // First button on the start page CTA is "Open New Folder" / 「新しいフォルダを開く」
  await page.locator('.cta button').first().click();
  await page.waitForURL(/#\/?$|#\/images/, { timeout: 15000 });
};

/**
 * Heuristic regression check: visible page text should not contain raw
 * translation keys (e.g. "open.welcome" or "headerSection.addImage").
 */
export const findRawTranslationKeys = async (page: Page): Promise<string[]> => {
  const text = await page.locator('body').innerText();
  const matches = text.match(/\b[a-z][a-zA-Z]+\.[a-z][a-zA-Z]+(\.[a-zA-Z]+)*\b/g) || [];
  // Filter obvious non-keys (file names, URLs, version strings)
  return matches.filter(m =>
    !/\.(png|jpe?g|json|xlsx|csv|tsx?|pdf|html)$/i.test(m) &&
    !/^(www|github|localhost|e2e)\./.test(m));
};
