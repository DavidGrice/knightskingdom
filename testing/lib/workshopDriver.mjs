import { BASE_URL, seedAuth, selectWorld, waitForMapLoad } from './driver.mjs';
import { TEST_ROUTES } from './testRoutes.mjs';

const WORKSHOP_PATH = TEST_ROUTES.startStack.workshop;
const WORKSHOP_WAIT_MS = 15000;

/** @param {import('puppeteer').Page} page */
const waitForWorkshop = async (page) => {
  await page.waitForFunction(
    () => {
      const root = document.querySelector('[data-testid="workshop-root"]');
      const toolbar = document.querySelector('[data-testid="workshop-toolbar-top"]');
      return Boolean(root && toolbar);
    },
    { timeout: WORKSHOP_WAIT_MS },
  );
  const url = page.url();
  if (!url.includes(WORKSHOP_PATH)) {
    throw new Error(`Expected workshop URL containing "${WORKSHOP_PATH}", got ${url}`);
  }
};

/** Enter workshop from main game (preserves WorldSession state). */
export const gotoWorkshop = async (page) => {
  await seedAuth(page);
  await selectWorld(page, 0);
  await waitForMapLoad(page, 8000);

  const hammer = await page.$('[data-testid="game-enter-workshop"]');
  if (!hammer) {
    throw new Error('game-enter-workshop button not found on main game');
  }
  await hammer.click();
  await waitForWorkshop(page);
};

/** @param {import('puppeteer').Page} page */
export const openWorkshopBucket = async (page) => {
  const btn = await page.$('[data-testid="workshop-toolbar-bucket"]');
  if (!btn) {
    throw new Error('workshop-toolbar-bucket not found');
  }
  await btn.click();
  await page.waitForSelector('[data-testid="workshop-bucket-panel"]', { timeout: 5000 });
};

/** @param {import('puppeteer').Page} page */
export const openWorkshopPalette = async (page) => {
  const btn = await page.$('[data-testid="workshop-toolbar-palette"]');
  if (!btn) {
    throw new Error('workshop-toolbar-palette not found');
  }
  await btn.click();
  await page.waitForSelector('[data-testid="workshop-palette-panel"]', { timeout: 5000 });
};

/** @param {import('puppeteer').Page} page */
export const gotoWorkshopWithBucket = async (page) => {
  await gotoWorkshop(page);
  await openWorkshopBucket(page);
};

/** @param {import('puppeteer').Page} page */
export const gotoWorkshopWithPalette = async (page) => {
  await gotoWorkshop(page);
  await openWorkshopPalette(page);
};