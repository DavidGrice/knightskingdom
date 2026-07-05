/**
 * Visual baseline matrix — fixed desktop viewport, menu-stage element captures.
 */
import path from 'path';
import { MENU_BASELINE_DIR } from './pixelDiffAssert.mjs';
import {
  gotoAuthenticationWithProfiles,
  gotoMainMenu,
  gotoOptions,
  gotoCredits,
  gotoWorldPicker,
  gotoMyModels,
  gotoSnapshot,
} from './menuDriver.mjs';

/** @typedef {{ label: string, screenKey: string, baselineFile: string, goto: (page: import('puppeteer').Page) => Promise<void> }} VisualBaselineScreen */

/** @type {VisualBaselineScreen[]} */
export const VISUAL_BASELINE_SCREENS = [
  {
    label: 'auth',
    screenKey: 'AUTHENTICATION',
    baselineFile: 'auth.png',
    goto: gotoAuthenticationWithProfiles,
  },
  {
    label: 'main-menu',
    screenKey: 'MAIN_MENU',
    baselineFile: 'main-menu.png',
    goto: gotoMainMenu,
  },
  {
    label: 'options',
    screenKey: 'OPTIONS',
    baselineFile: 'options.png',
    goto: gotoOptions,
  },
  {
    label: 'credits',
    screenKey: 'CREDITS',
    baselineFile: 'credits.png',
    goto: gotoCredits,
  },
  {
    label: 'start-world-local',
    screenKey: 'START_WORLD',
    baselineFile: 'start-world-local.png',
    goto: gotoWorldPicker,
  },
  {
    label: 'start-world-shared',
    screenKey: 'START_WORLD',
    baselineFile: 'start-world-shared.png',
    goto: async (page) => {
      await gotoWorldPicker(page);
      const sharedTab = await page.$('[data-testid="world-tab-shared"]');
      if (!sharedTab) {
        throw new Error('world-tab-shared not found');
      }
      await sharedTab.click();
      await page.waitForFunction(
        () => document.querySelector('[data-testid="world-tab-shared"]')?.getAttribute('data-active') === 'true',
        { timeout: 5000 },
      );
      await new Promise((r) => setTimeout(r, 300));
    },
  },
  {
    label: 'my-models',
    screenKey: 'MY_MODELS',
    baselineFile: 'my-models.png',
    goto: gotoMyModels,
  },
  {
    label: 'snapshot',
    screenKey: 'SNAPSHOT',
    baselineFile: 'snapshot.png',
    goto: gotoSnapshot,
  },
];

/** @param {VisualBaselineScreen} screen */
export const baselinePathFor = (screen) => path.join(MENU_BASELINE_DIR, screen.baselineFile);