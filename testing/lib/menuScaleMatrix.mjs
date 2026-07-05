/**
 * Cross-screen scale matrix configuration — all MenuStageLayout screenKeys.
 */

import {
  gotoAuthenticationWithProfiles,
  gotoMainMenu,
  gotoOptions,
  gotoCredits,
  gotoWorldPicker,
  gotoMyModels,
  gotoSnapshot,
} from './menuDriver.mjs';

/** Representative viewports: desktop, mobile, ultrawide */
export const SCALE_MATRIX_VIEWPORTS = [
  { width: 1280, height: 800, label: 'desktop-1280' },
  { width: 375, height: 667, label: 'mobile-375' },
  { width: 2560, height: 1440, label: 'desktop-2560' },
];

/** @typedef {{ screenKey: string, label: string, goto: (page: import('puppeteer').Page) => Promise<void> }} ScaleMatrixScreen */

/** @type {ScaleMatrixScreen[]} */
export const SCALE_MATRIX_SCREENS = [
  {
    screenKey: 'AUTHENTICATION',
    label: 'auth',
    goto: gotoAuthenticationWithProfiles,
  },
  {
    screenKey: 'MAIN_MENU',
    label: 'main-menu',
    goto: gotoMainMenu,
  },
  {
    screenKey: 'OPTIONS',
    label: 'options',
    goto: gotoOptions,
  },
  {
    screenKey: 'CREDITS',
    label: 'credits',
    goto: gotoCredits,
  },
  {
    screenKey: 'START_WORLD',
    label: 'start-world',
    goto: gotoWorldPicker,
  },
  {
    screenKey: 'MY_MODELS',
    label: 'my-models',
    goto: gotoMyModels,
  },
  {
    screenKey: 'SNAPSHOT',
    label: 'snapshot',
    goto: gotoSnapshot,
  },
];

/**
 * Lightweight per-screen DOM sanity (scale matrix — not full layout contract).
 * @param {import('puppeteer').Page} page
 * @param {string} screenKey
 */
export const assertScaleMatrixSanity = async (page, screenKey) => {
  const checks = {
    AUTHENTICATION: '[data-testid="profile-row"]',
    MAIN_MENU: '[class*="menuButton"]',
    OPTIONS: '[class*="optionRow"]',
    CREDITS: '[data-testid="credits-scroll-panel"]',
    START_WORLD: '[data-testid="world-panel-shell"]',
    MY_MODELS: '[data-testid="menu-panel-shell"]',
    SNAPSHOT: '[data-testid="menu-panel-shell"]',
  };

  const selector = checks[screenKey];
  if (!selector) {
    throw new Error(`No sanity selector for screenKey: ${screenKey}`);
  }

  const el = await page.$(selector);
  if (!el) {
    throw new Error(`${screenKey}: expected element ${selector}`);
  }
};