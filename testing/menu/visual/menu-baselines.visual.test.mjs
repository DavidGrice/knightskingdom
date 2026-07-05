/**
 * P5 — Visual baselines: capture menu-stage at 1280×800 and pixel-diff against
 * committed baselines in testing/menu/baselines/desktop-1280/.
 *
 * Update baselines: TEST_UPDATE_BASELINES=1 node testing/menu/visual/menu-baselines.visual.test.mjs
 */
import path from 'path';
import { assertDevServerReady, launch } from '../../lib/driver.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { captureMenuStagePng, VISUAL_VIEWPORT } from '../../lib/menuVisualCapture.mjs';
import { VISUAL_BASELINE_SCREENS, baselinePathFor } from '../../lib/menuVisualMatrix.mjs';
import { assertVisualBaseline, VISUAL_DIFF_DIR } from '../../lib/pixelDiffAssert.mjs';

const UPDATE_BASELINES = process.env.TEST_UPDATE_BASELINES === '1';
const ACTUAL_DIR = path.join(process.cwd(), 'testing', 'output', 'visual-actual');

const main = async () => {
  await assertDevServerReady();
  const { browser, page, errors } = await launch();

  const results = [];

  try {
    await page.setViewport(VISUAL_VIEWPORT);

    for (const screen of VISUAL_BASELINE_SCREENS) {
      // eslint-disable-next-line no-await-in-loop
      await screen.goto(page);

      const actualPath = path.join(ACTUAL_DIR, screen.baselineFile);
      const baselinePath = baselinePathFor(screen);

      // eslint-disable-next-line no-await-in-loop
      await captureMenuStagePng(page, actualPath, { screenKey: screen.screenKey });

      // eslint-disable-next-line no-await-in-loop
      const outcome = await assertVisualBaseline({
        label: screen.label,
        actualPath,
        baselinePath,
        updateBaselines: UPDATE_BASELINES,
      });

      results.push(outcome);
      const status = UPDATE_BASELINES ? 'UPDATED' : `diff=${outcome.diffPixels ?? 0}px`;
      console.log(`  OK ${screen.label} ${status}`);
    }

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-baselines.visual', {
      screens: VISUAL_BASELINE_SCREENS.length,
      viewport: VISUAL_VIEWPORT.label,
      mode: UPDATE_BASELINES ? 'update' : 'compare',
      diffDir: UPDATE_BASELINES ? null : VISUAL_DIFF_DIR,
    });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-baselines.visual:', e.message);
  process.exit(1);
});