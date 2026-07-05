/**
 * Shared layout assertions for menu regression tests.
 * Targets MenuStageLayout data-testid hooks and holder grid geometry.
 */

export const MENU_STAGE_SIZE = { width: 800, height: 600 };

/** Read --msl-scale from the menu scaler element */
export const readMenuScale = async (page) => page.evaluate(() => {
  const scaler = document.querySelector('[data-testid="menu-scaler"]');
  if (!scaler) {
    return null;
  }
  const raw = getComputedStyle(scaler).getPropertyValue('--msl-scale').trim();
  return raw ? Number(raw) : 1;
});

/** Bounding rect of menu stage in viewport pixels */
export const readStageRect = async (page) => {
  const handle = await page.$('[data-testid="menu-stage"]');
  if (!handle) {
    return null;
  }
  return handle.boundingBox();
};

/** Assert stage exists, is scaled, and is roughly centered */
export const assertMenuStagePresent = async (page, { screenKey = null } = {}) => {
  const stage = await page.$('[data-testid="menu-stage"]');
  if (!stage) {
    throw new Error('menu-stage not found — MenuStageLayout not mounted');
  }

  if (screenKey) {
    const attr = await page.$eval('[data-testid="menu-stage"]', (el) => el.getAttribute('data-screen'));
    if (attr !== screenKey) {
      throw new Error(`Expected data-screen="${screenKey}", got "${attr}"`);
    }
  }

  const scale = await readMenuScale(page);
  if (!scale || scale <= 0) {
    throw new Error(`Invalid --msl-scale: ${scale}`);
  }

  const rect = await readStageRect(page);
  if (!rect) {
    throw new Error('Could not measure menu-stage bounding box');
  }

  const viewport = page.viewport();
  const expectedW = MENU_STAGE_SIZE.width * scale;
  const expectedH = MENU_STAGE_SIZE.height * scale;
  const wDrift = Math.abs(rect.width - expectedW);
  const hDrift = Math.abs(rect.height - expectedH);

  if (wDrift > 4 || hDrift > 4) {
    throw new Error(
      `Stage size drift: got ${rect.width.toFixed(1)}×${rect.height.toFixed(1)}, `
      + `expected ~${expectedW.toFixed(1)}×${expectedH.toFixed(1)} (scale=${scale})`,
    );
  }

  const centerX = rect.x + rect.width / 2;
  const vpCenterX = viewport.width / 2;
  if (Math.abs(centerX - vpCenterX) > 8) {
    throw new Error(`Stage not horizontally centered: centerX=${centerX}, vp=${vpCenterX}`);
  }

  return { scale, rect };
};

/** Assert a 3×3 grid body is present with expected cell count on current page */
export const assertPaginatedGrid = async (page, { minItems = 1, maxItems = 9 } = {}) => {
  const items = await page.$$('[class*="body"] > [class*="item"]');
  const gridItems = await page.$$('[class*="HolderGridLayout_body"] [class*="item"]');
  const cells = gridItems.length > 0 ? gridItems : items;
  if (cells.length < minItems || cells.length > maxItems) {
    throw new Error(`Expected ${minItems}-${maxItems} grid cells, found ${cells.length}`);
  }
  return cells.length;
};

/** Assert dual-header tab strip when on world picker */
export const assertDualHeader = async (page) => {
  const localTab = await page.$('[class*="localWorldsHeader"]');
  const sharedTab = await page.$('[class*="sharedWorldsHeader"]');
  if (!localTab || !sharedTab) {
    throw new Error('Dual header tabs (localWorldsHeader / sharedWorldsHeader) not found');
  }
};

/** Save screenshot to testing/output/ for manual review (gitignored) */
export const captureScreenshot = async (page, name) => {
  const fs = await import('fs');
  const path = await import('path');
  const outDir = path.join(process.cwd(), 'testing', 'output');
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
};