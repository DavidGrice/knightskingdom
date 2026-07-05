/**
 * Deterministic menu-stage screenshots for visual baseline tests.
 */
import fs from 'fs';
import path from 'path';
import { assertMenuStagePresent } from './menuLayoutAssert.mjs';

export const VISUAL_VIEWPORT = { width: 1280, height: 800, label: 'desktop-1280' };

const FREEZE_MOTION_CSS = `
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}
[class*="textScroll"] {
  transform: none !important;
}
`;

/** @param {import('puppeteer').Page} page */
export const freezeMotion = async (page) => {
  await page.addStyleTag({ content: FREEZE_MOTION_CSS });
  await new Promise((r) => setTimeout(r, 150));
};

/**
 * Capture the 800×600 menu stage element as PNG.
 * @param {import('puppeteer').Page} page
 * @param {string} outPath
 * @param {{ screenKey?: string }} [opts]
 */
export const captureMenuStagePng = async (page, outPath, opts = {}) => {
  if (opts.screenKey) {
    await assertMenuStagePresent(page, { screenKey: opts.screenKey });
  } else {
    await assertMenuStagePresent(page);
  }

  await freezeMotion(page);

  const stage = await page.$('[data-testid="menu-stage"]');
  if (!stage) {
    throw new Error('menu-stage not found for visual capture');
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await stage.screenshot({ path: outPath });
  return outPath;
};