/**
 * Workshop visual baselines — full viewport at 1280×800 (canvas hidden for stability).
 * Update: TEST_UPDATE_BASELINES=1 node testing/workshop/visual/workshop-baselines.visual.test.mjs
 */
import path from 'path';
import { assertDevServerReady, launch } from '../../lib/driver.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import {
  captureWorkshopViewportPng,
  WORKSHOP_VISUAL_VIEWPORT,
} from '../../lib/workshopVisualCapture.mjs';
import {
  WORKSHOP_VISUAL_SCREENS,
  workshopBaselinePathFor,
} from '../../lib/workshopVisualMatrix.mjs';
import { assertVisualBaseline, VISUAL_DIFF_DIR } from '../../lib/pixelDiffAssert.mjs';

const UPDATE_BASELINES = process.env.TEST_UPDATE_BASELINES === '1';
const ACTUAL_DIR = path.join(process.cwd(), 'testing', 'output', 'workshop-actual');

const main = async () => {
  await assertDevServerReady();
  const { browser, page, errors } = await launch();

  try {
    await page.setViewport(WORKSHOP_VISUAL_VIEWPORT);

    for (const screen of WORKSHOP_VISUAL_SCREENS) {
      // eslint-disable-next-line no-await-in-loop
      await screen.goto(page);

      const actualPath = path.join(ACTUAL_DIR, screen.baselineFile);
      const baselinePath = workshopBaselinePathFor(screen);

      // eslint-disable-next-line no-await-in-loop
      await captureWorkshopViewportPng(page, actualPath);

      // eslint-disable-next-line no-await-in-loop
      const outcome = await assertVisualBaseline({
        label: screen.label,
        actualPath,
        baselinePath,
        updateBaselines: UPDATE_BASELINES,
      });

      const status = UPDATE_BASELINES ? 'UPDATED' : `diff=${outcome.diffPixels ?? 0}px`;
      console.log(`  OK ${screen.label} ${status}`);
    }

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS workshop-baselines.visual', {
      screens: WORKSHOP_VISUAL_SCREENS.length,
      viewport: WORKSHOP_VISUAL_VIEWPORT.label,
      mode: UPDATE_BASELINES ? 'update' : 'compare',
      diffDir: UPDATE_BASELINES ? null : VISUAL_DIFF_DIR,
    });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL workshop-baselines.visual:', e.message);
  process.exit(1);
});