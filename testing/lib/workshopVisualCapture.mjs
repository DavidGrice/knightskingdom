/**
 * Deterministic workshop viewport screenshots for visual baselines.
 * Hides WebGL canvas to avoid GPU variance; freezes CSS motion.
 */
import fs from 'fs';
import path from 'path';
import { assertWorkshopChromePresent } from './workshopLayoutAssert.mjs';

export const WORKSHOP_VISUAL_VIEWPORT = { width: 1280, height: 800, label: 'desktop-1280' };

const FREEZE_CSS = `
*, *::before, *::after {
  animation: none !important;
  transition: none !important;
}
canvas {
  visibility: hidden !important;
}
`;

/** @param {import('puppeteer').Page} page */
export const freezeWorkshopVisuals = async (page) => {
  await page.addStyleTag({ content: FREEZE_CSS });
  await new Promise((r) => setTimeout(r, 200));
};

/**
 * Full-viewport workshop screenshot at fixed size.
 * @param {import('puppeteer').Page} page
 * @param {string} outPath
 */
export const captureWorkshopViewportPng = async (page, outPath) => {
  await assertWorkshopChromePresent(page);
  await freezeWorkshopVisuals(page);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: false });
  return outPath;
};