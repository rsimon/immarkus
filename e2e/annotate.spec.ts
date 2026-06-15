import { expect, test, Page } from '@playwright/test';
import { findRawTranslationKeys, mockWorkFolder, openWorkFolder, setLanguage } from './helpers';

// The annotate toolbar collapses GDocs-style when it overflows (at the
// default 1280px viewport the "Add image" button etc. move into a "more
// tools" popover). Use a wide viewport so the full toolbar is rendered.
test.use({ viewport: { width: 1920, height: 1080 } });

// The annotation canvas (OpenSeadragon + Annotorious + plugins) is heavy;
// with several workers booting it in parallel the default 30s can be tight.
test.describe.configure({ timeout: 60000 });

/**
 * Hovers a tooltip trigger, asserts the translated tooltip text, then
 * dismisses it with Escape and waits until it is gone. The dismissal is
 * required: while a Radix tooltip is still open, hovering the next trigger
 * does not open its tooltip (hoverable-content grace handling), which makes
 * back-to-back hover assertions silently fail.
 */
const expectTooltip = async (page: Page, trigger: ReturnType<Page['locator']>, text: string) => {
  await trigger.hover();
  await expect(page.getByText(text).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText(text)).toHaveCount(0);
};

/**
 * Collects uncaught page errors. The annotation canvas stack
 * (OpenSeadragon / Annotorious / SAM plugin) probes GPU + WebGPU features
 * that headless Chromium may not provide. Errors originating from that
 * stack are reported but excluded from the assertion — they are caused by
 * the headless environment, not by the i18n changes under test.
 */
const collectPageErrors = (page: Page): Error[] => {
  const errors: Error[] = [];
  page.on('pageerror', error => errors.push(error));
  return errors;
};

const isHeadlessGpuError = (error: Error): boolean =>
  /webgpu|gpu|adapter|webgl|annotorious|openseadragon|segment.?anything|\bsam\b|onnx|wasm/i
    .test(`${error.message}\n${error.stack ?? ''}`);

const assertNoOwnPageErrors = (errors: Error[]) => {
  const excluded = errors.filter(isHeadlessGpuError);
  if (excluded.length > 0)
    console.log(
      `[annotate.spec] Excluded ${excluded.length} headless-GPU/plugin error(s):`,
      excluded.map(e => e.message));
  expect(errors.filter(e => !isHeadlessGpuError(e))).toEqual([]);
};

/** Boots the app with the mocked work folder and lands on /#/images. */
const bootApp = async (page: Page, lang: 'en' | 'ja') => {
  await setLanguage(page, lang);
  await mockWorkFolder(page);
  await page.goto('/');
  await openWorkFolder(page);
};

/**
 * Opens sample.png in the annotation view by clicking its thumbnail in the
 * images overview (client-side navigation — keeps the store alive).
 */
const openSampleImage = async (page: Page) => {
  const thumbnail = page.getByRole('img', { name: 'sample.png' });
  await thumbnail.waitFor({ timeout: 15000 });
  await thumbnail.click();
  await page.waitForURL(/#\/annotate\/.+/, { timeout: 15000 });
};

test.describe('annotate – empty workspace', () => {

  test('renders translated empty-workspace instructions (ja)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await bootApp(page, 'ja');

    // Navigate to the empty workspace via the app sidebar (no image id in URL)
    await page.getByRole('link', { name: 'ワークスペース' }).click();
    await page.waitForURL(/#\/annotate$/);

    await expect(page.getByText('ワークスペースは空です')).toBeVisible();

    // <Trans>-interpolated paragraphs (text is split around inline icons)
    const annotatePage = page.locator('.page.annotate');
    await expect(annotatePage).toContainText('ギャラリーから画像を開いてください');
    await expect(annotatePage).toContainText('画像を追加');
    await expect(annotatePage).toContainText('ツールで保存・復元できます');

    expect(await findRawTranslationKeys(page)).toEqual([]);
    assertNoOwnPageErrors(errors);
  });

  test('renders translated empty-workspace instructions (en)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await bootApp(page, 'en');

    await page.getByRole('link', { name: 'Workspace' }).click();
    await page.waitForURL(/#\/annotate$/);

    await expect(page.getByText('Your workspace is empty')).toBeVisible();

    const annotatePage = page.locator('.page.annotate');
    await expect(annotatePage).toContainText('Start by opening an image from the');
    await expect(annotatePage).toContainText('Add image');
    await expect(annotatePage).toContainText('Save and restore workspace layouts');

    expect(await findRawTranslationKeys(page)).toEqual([]);
    assertNoOwnPageErrors(errors);
  });

});

test.describe('annotate – image open', () => {

  test('shows translated toolbar, tooltips and sidebar (ja)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await bootApp(page, 'ja');
    await openSampleImage(page);

    // --- Header chrome -----------------------------------------------------
    // "Add image" toolbar button (visible label)
    await expect(page.getByRole('button', { name: '画像を追加' })).toBeVisible();

    // Move-mode button label
    await expect(page.getByRole('button', { name: '移動' })).toBeVisible();

    // Hover tooltips. The zoom buttons are disabled (no tooltip) until the
    // image is registered, so wait for enablement first. We wait on DOM
    // elements only — never on canvas rendering.
    const zoomIn = page.locator('button:has(svg.lucide-zoom-in)');
    await expect(zoomIn).toBeEnabled({ timeout: 30000 });
    await expectTooltip(page, zoomIn, 'ズームイン');

    // "Add image" tooltip
    await expectTooltip(page, page.getByRole('button', { name: '画像を追加' }), '画像をワークスペースに追加');

    // Smart tools button tooltip
    const smartToolsButton = page.locator('button:has(svg.lucide-wand-sparkles)');
    await expectTooltip(page, smartToolsButton, 'スマートアノテーションツール');

    // Tool selector dropdown options
    await page.locator('.tool-dropdown-trigger').click();
    await expect(page.getByRole('option', { name: '矩形' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'ポリゴン' })).toBeVisible();
    await expect(page.getByRole('option', { name: '楕円' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'パス' })).toBeVisible();
    await page.keyboard.press('Escape');

    // --- Sidebar -----------------------------------------------------------
    await expect(page.getByRole('tab', { name: '選択' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'リスト' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'メタデータ' })).toBeVisible();

    // Selection tab empty state
    await expect(page.getByText('アノテーションが選択されていません')).toBeVisible();

    // Annotation list tab: filter / select-all controls
    await page.getByRole('tab', { name: 'リスト' }).click();
    await expect(page.getByText('表示:')).toBeVisible();
    await expect(page.getByText('すべて選択')).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    assertNoOwnPageErrors(errors);
  });

  test('shows translated toolbar, tooltips and sidebar (en)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await bootApp(page, 'en');
    await openSampleImage(page);

    await expect(page.getByRole('button', { name: 'Add image' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Move' })).toBeVisible();

    const zoomIn = page.locator('button:has(svg.lucide-zoom-in)');
    await expect(zoomIn).toBeEnabled({ timeout: 30000 });
    await expectTooltip(page, zoomIn, 'Zoom in');
    await expectTooltip(page, page.getByRole('button', { name: 'Add image' }), 'Add image to workspace');
    await expectTooltip(page, page.locator('button:has(svg.lucide-wand-sparkles)'), 'Smart annotation tools');

    await page.locator('.tool-dropdown-trigger').click();
    await expect(page.getByRole('option', { name: 'Box' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Polygon' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Ellipse' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Path' })).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('tab', { name: 'Selection' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'List' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Metadata' })).toBeVisible();
    await expect(page.getByText('No annotation selected')).toBeVisible();

    await page.getByRole('tab', { name: 'List' }).click();
    await expect(page.getByText('Select All')).toBeVisible();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    assertNoOwnPageErrors(errors);
  });

});

test.describe('annotate – smart tools panel', () => {

  /**
   * The panel branches on `'gpu' in navigator`: with WebGPU it renders the
   * tool accordion, without it the "not supported" fallback. Headless
   * Chromium may expose either state — both are translated, so assert
   * whichever one renders.
   */
  const assertSmartToolsPanel = async (page: Page, lang: 'en' | 'ja') => {
    const smartToolsButton = page.locator('button:has(svg.lucide-wand-sparkles)');
    await smartToolsButton.click();

    const strings = lang === 'ja'
      ? {
          title: 'スマートツール',
          tools: ['スマートシザーズ', 'エッジスナップ', '自動選択', 'ビジュアル検索'],
          notSupported: '非対応',
          notSupportedDetail: 'WebGPU'
        }
      : {
          title: 'Smart Tools',
          tools: ['Smart Scissors', 'Edge Snap', 'Auto Select', 'Visual Search'],
          notSupported: 'Not Supported',
          notSupportedDetail: 'WebGPU'
        };

    await expect(page.getByText(strings.title, { exact: true })).toBeVisible();

    const webGpuAvailable = await page.evaluate(() => 'gpu' in navigator);
    console.log(`[annotate.spec] WebGPU available in headless Chromium: ${webGpuAvailable}`);

    if (webGpuAvailable) {
      for (const tool of strings.tools)
        await expect(page.getByText(tool, { exact: true })).toBeVisible();
    } else {
      await expect(page.getByText(strings.notSupported, { exact: true })).toBeVisible();
      await expect(page.getByText(new RegExp(strings.notSupportedDetail))).toBeVisible();
    }
  };

  test('renders translated smart tools panel or WebGPU fallback (ja)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await bootApp(page, 'ja');
    await openSampleImage(page);
    await assertSmartToolsPanel(page, 'ja');

    expect(await findRawTranslationKeys(page)).toEqual([]);
    assertNoOwnPageErrors(errors);
  });

  test('renders translated smart tools panel or WebGPU fallback (en)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await bootApp(page, 'en');
    await openSampleImage(page);
    await assertSmartToolsPanel(page, 'en');

    expect(await findRawTranslationKeys(page)).toEqual([]);
    assertNoOwnPageErrors(errors);
  });

});
