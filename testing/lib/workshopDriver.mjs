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

/** Workshop bucket tab index for D5 challenge tutorials. */
export const WORKSHOP_CHALLENGES_TAB = 9;

/** @param {import('puppeteer').Page} page @param {number} tabIndex */
export const selectWorkshopBucketTab = async (page, tabIndex) => {
  const tab = await page.$(`[data-testid="workshop-bucket-tab-${tabIndex}"]`);
  if (!tab) {
    throw new Error(`workshop-bucket-tab-${tabIndex} not found`);
  }
  await tab.click();
  await page.waitForFunction(
    (index) => {
      const tabEl = document.querySelector(`[data-testid="workshop-bucket-tab-${index}"]`);
      if (!tabEl) {
        return false;
      }
      const items = document.querySelectorAll('[data-testid="workshop-bucket-item"]');
      return items.length > 0;
    },
    { timeout: 5000 },
    tabIndex,
  );
};

/** @param {import('puppeteer').Page} page @param {string} challengeId */
export const selectWorkshopChallenge = async (page, challengeId) => {
  const item = await page.$(`[data-testid="workshop-bucket-item"][data-challenge-id="${challengeId}"]`);
  if (!item) {
    throw new Error(`workshop challenge tile "${challengeId}" not found`);
  }
  await item.click();
  await page.waitForSelector('[data-testid="workshop-instructions-panel"]', { timeout: 10000 });
};

/** @param {import('puppeteer').Page} page @param {string} challengeId */
export const openWorkshopChallenge = async (page, challengeId) => {
  await gotoWorkshop(page);
  await openWorkshopBucket(page);
  await selectWorkshopBucketTab(page, WORKSHOP_CHALLENGES_TAB);
  await selectWorkshopChallenge(page, challengeId);
};