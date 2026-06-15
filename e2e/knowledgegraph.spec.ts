import { Page, expect, test } from '@playwright/test';
import { findRawTranslationKeys, mockWorkFolder, openWorkFolder, setLanguage } from './helpers';

/**
 * E2E i18n checks for the Knowledge Graph page (namespace `knowledgegraph`).
 *
 * Notes:
 * - Navigation happens via the sidebar link (client-side, no reload), because a
 *   full reload would restore the work-folder handle from IndexedDB where our
 *   mocked requestPermission() monkey-patch is not preserved.
 * - The force-graph canvas renders data values (file names) — not translatable,
 *   intentionally not asserted on.
 * - Default settings: graphMode=HIERARCHY, includeFolders=off, legend expanded.
 *   Therefore folder-related and relationship legend entries must be ABSENT.
 */

// The force-graph physics simulation is CPU-heavy. Running several graph pages
// in parallel workers starves the browser main thread and makes actionability
// checks (hover/click) time out. Run this file's tests sequentially instead.
test.describe.configure({ mode: 'default' });

const SIDEBAR_LINK = { en: 'Knowledge Graph', ja: 'ナレッジグラフ' };

/** Collects uncaught page errors for the no-crash assertion. */
const collectPageErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(String(err)));
  return errors;
};

/** Boots the app in the given language, opens the mocked work folder and
 *  navigates (client-side) to the Knowledge Graph page. */
const gotoKnowledgeGraph = async (page: Page, lang: 'en' | 'ja') => {
  await setLanguage(page, lang);
  await mockWorkFolder(page);
  await page.goto('/');
  await openWorkFolder(page);
  await page.getByRole('link', { name: SIDEBAR_LINK[lang] }).click();
  await page.waitForURL(/#\/graph/);
  // Page heading doubles as "graph page is mounted" signal
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
};

test.describe('knowledge graph page i18n', () => {

  test('shows translated title, description and legend (en)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'en');

    const main = page.locator('main');

    // knowledgeGraph.* intro
    await expect(page.getByRole('heading', { name: 'Knowledge Graph', level: 1 })).toBeVisible();
    await expect(main.getByText('Explore connections between images and entities', { exact: false })).toBeVisible();

    // legend.* — node entries (legend is expanded by default)
    await expect(main.getByText('Nodes', { exact: true })).toBeVisible();
    await expect(main.getByText('Entity Class', { exact: true })).toBeVisible();
    await expect(main.getByText('Image', { exact: true })).toBeVisible();
    // includeFolders is off by default → no sub-folder node entry
    await expect(main.getByText('Sub-Folder', { exact: true })).toBeHidden();

    // legend.* — edge entries for HIERARCHY mode without folders
    await expect(main.getByText('Edges', { exact: true })).toBeVisible();
    await expect(main.getByText('Entity class hierarchy', { exact: true })).toBeVisible();
    await expect(main.getByText('Entity Annotations', { exact: true })).toBeVisible();
    await expect(main.getByText('Folder structure', { exact: true })).toBeHidden();
    // legend.relationship.* only shows in RELATIONS graph mode
    await expect(main.getByText('Connections based on Relationships', { exact: false })).toBeHidden();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('shows translated title, description and legend (ja)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'ja');

    const main = page.locator('main');

    // knowledgeGraph.* intro
    await expect(page.getByRole('heading', { name: 'ナレッジグラフ', level: 1 })).toBeVisible();
    await expect(main.getByText('画像とエンティティのつながりを探索できます', { exact: false })).toBeVisible();

    // legend.* — node entries
    await expect(main.getByText('ノード', { exact: true })).toBeVisible();
    await expect(main.getByText('エンティティクラス', { exact: true })).toBeVisible();
    await expect(main.getByText('画像', { exact: true })).toBeVisible();
    await expect(main.getByText('サブフォルダ', { exact: true })).toBeHidden();

    // legend.* — edge entries
    await expect(main.getByText('エッジ', { exact: true })).toBeVisible();
    await expect(main.getByText('エンティティクラス階層', { exact: true })).toBeVisible();
    await expect(main.getByText('エンティティアノテーション', { exact: true })).toBeVisible();
    await expect(main.getByText('フォルダ構造', { exact: true })).toBeHidden();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('graph controls have translated tooltips (en)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'en');

    const main = page.locator('main');

    // Fullscreen toggle (top right, icon-only → identified via lucide icon)
    await main.locator('button:has(.lucide-fullscreen)').hover();
    await expect(page.getByRole('tooltip', { name: 'Toggle fullscreen' })).toBeVisible();

    // Graph search button
    await main.locator('button:has(.lucide-search)').hover();
    await expect(page.getByRole('tooltip', { name: 'Graph search' })).toBeVisible();

    // Settings button: visible label + tooltip
    const settingsButton = page.getByRole('button', { name: 'Settings', exact: true });
    await expect(settingsButton).toBeVisible();
    await settingsButton.hover();
    await expect(page.getByRole('tooltip', { name: 'Graph settings' })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('graph controls have translated tooltips (ja)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'ja');

    const main = page.locator('main');

    await main.locator('button:has(.lucide-fullscreen)').hover();
    await expect(page.getByRole('tooltip', { name: '全画面表示を切り替え' })).toBeVisible();

    await main.locator('button:has(.lucide-search)').hover();
    await expect(page.getByRole('tooltip', { name: 'グラフ検索' })).toBeVisible();

    const settingsButton = page.getByRole('button', { name: '設定', exact: true });
    await expect(settingsButton).toBeVisible();
    await settingsButton.hover();
    await expect(page.getByRole('tooltip', { name: 'グラフ設定' })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('settings panel is fully translated (en)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'en');

    const main = page.locator('main');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();

    // settingsPanel.graphType.*
    await expect(main.getByText('Graph Type', { exact: true })).toBeVisible();
    await expect(main.getByText('Select how you want to visualize your data.')).toBeVisible();
    await expect(main.getByText('Hierarchy & Annotations', { exact: true })).toBeVisible();
    await expect(main.getByText('Relationships', { exact: true })).toBeVisible();

    // settingsPanel toggles
    await expect(main.getByText('Hide labels', { exact: true })).toBeVisible();
    await expect(main.getByText("Don't show text labels for graph nodes", { exact: false })).toBeVisible();
    await expect(main.getByText('Show sub-folders as nodes', { exact: true })).toBeVisible();
    await expect(main.getByText('Hide unconnected nodes', { exact: true })).toBeVisible();

    // Expand "Hide for specific node types"
    await main.getByText('Hide for specific node types', { exact: true }).click();
    await expect(main.getByText('Image labels', { exact: true })).toBeVisible();
    await expect(main.getByText('Entity class labels', { exact: true })).toBeVisible();
    // includeFolders off → no sub-folder label switch
    await expect(main.getByText('Sub-folder labels', { exact: true })).toBeHidden();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('settings panel is fully translated (ja)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'ja');

    const main = page.locator('main');
    await page.getByRole('button', { name: '設定', exact: true }).click();

    await expect(main.getByText('グラフタイプ', { exact: true })).toBeVisible();
    await expect(main.getByText('データの可視化方法を選択します。')).toBeVisible();
    await expect(main.getByText('階層とアノテーション', { exact: true })).toBeVisible();
    await expect(main.getByText('リレーション', { exact: true })).toBeVisible();

    await expect(main.getByText('ラベルを非表示', { exact: true })).toBeVisible();
    await expect(main.getByText('グラフノードのテキストラベルを表示しません', { exact: false })).toBeVisible();
    await expect(main.getByText('サブフォルダをノードとして表示', { exact: true })).toBeVisible();
    await expect(main.getByText('接続のないノードを非表示', { exact: true })).toBeVisible();

    await main.getByText('特定のノードタイプのみ非表示', { exact: true }).click();
    await expect(main.getByText('画像ラベル', { exact: true })).toBeVisible();
    await expect(main.getByText('エンティティクラスラベル', { exact: true })).toBeVisible();
    await expect(main.getByText('サブフォルダラベル', { exact: true })).toBeHidden();

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('graph search dialog is translated (en)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'en');

    await page.locator('main button:has(.lucide-search)').click();
    // Move pointer away so the button tooltip ("Graph search") closes and
    // does not collide with the dialog title assertion below.
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toBeHidden();

    // graphSearch.* — the dialog is portalled to document.body
    await expect(page.getByText('Graph Search', { exact: true })).toBeVisible();
    await expect(page.getByText('Find', { exact: true })).toBeVisible();

    const nodeTypeSelect = page.getByRole('combobox');
    await expect(nodeTypeSelect).toContainText('select node type...');

    // Default HIERARCHY mode without folders → only "images" is offered
    await nodeTypeSelect.click();
    await expect(page.getByRole('option', { name: 'images', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'entity classes', exact: true })).toBeHidden();
    await expect(page.getByRole('option', { name: 'sub-folders', exact: true })).toBeHidden();
    await page.keyboard.press('Escape');

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

  test('graph search dialog is translated (ja)', async ({ page }) => {
    const errors = collectPageErrors(page);
    await gotoKnowledgeGraph(page, 'ja');

    await page.locator('main button:has(.lucide-search)').click();
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toBeHidden();

    await expect(page.getByText('グラフ検索', { exact: true })).toBeVisible();
    await expect(page.getByText('検索対象', { exact: true })).toBeVisible();

    const nodeTypeSelect = page.getByRole('combobox');
    await expect(nodeTypeSelect).toContainText('ノードタイプを選択...');

    await nodeTypeSelect.click();
    await expect(page.getByRole('option', { name: '画像', exact: true })).toBeVisible();
    await expect(page.getByRole('option', { name: 'エンティティクラス', exact: true })).toBeHidden();
    await expect(page.getByRole('option', { name: 'サブフォルダ', exact: true })).toBeHidden();
    await page.keyboard.press('Escape');

    expect(await findRawTranslationKeys(page)).toEqual([]);
    expect(errors).toEqual([]);
  });

});
