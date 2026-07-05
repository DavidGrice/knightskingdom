import path from 'path';
import {
  gotoWorkshop,
  gotoWorkshopWithBucket,
  gotoWorkshopWithPalette,
} from './workshopDriver.mjs';

export const WORKSHOP_BASELINE_DIR = path.join(
  process.cwd(),
  'testing',
  'workshop',
  'baselines',
  'desktop-1280',
);

/** @typedef {{ label: string, baselineFile: string, goto: (page: import('puppeteer').Page) => Promise<void> }} WorkshopVisualScreen */

/** @type {WorkshopVisualScreen[]} */
export const WORKSHOP_VISUAL_SCREENS = [
  {
    label: 'workshop-default',
    baselineFile: 'workshop-default.png',
    goto: gotoWorkshop,
  },
  {
    label: 'workshop-bucket',
    baselineFile: 'workshop-bucket.png',
    goto: gotoWorkshopWithBucket,
  },
  {
    label: 'workshop-palette',
    baselineFile: 'workshop-palette.png',
    goto: gotoWorkshopWithPalette,
  },
];

/** @param {WorkshopVisualScreen} screen */
export const workshopBaselinePathFor = (screen) => path.join(
  WORKSHOP_BASELINE_DIR,
  screen.baselineFile,
);