import { assertDevServerReady, launch } from '../../lib/driver.mjs';
import { gotoWorkshopWithPalette } from '../../lib/workshopDriver.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import {
  assertWorkshopChromePresent,
  measureWorkshopLayout,
  assertWorkshopLayoutContract,
  writeWorkshopLayoutArtifact,
} from '../../lib/workshopLayoutAssert.mjs';
import { WORKSHOP_STAGE_METRICS } from '../../../src/Components/Common/WorkshopStageLayout/workshopStageMetrics.js';

const VIEWPORT = { width: 1280, height: 800 };

const main = async () => {
  await assertDevServerReady();
  const { browser, page, errors } = await launch();

  try {
    await page.setViewport(VIEWPORT);
    await gotoWorkshopWithPalette(page);
    const { scale } = await assertWorkshopChromePresent(page);

    const measured = await measureWorkshopLayout(page);
    const layoutErrors = assertWorkshopLayoutContract(WORKSHOP_STAGE_METRICS, measured, {
      tolerance: 8,
    });
    if (layoutErrors.length > 0) {
      throw new Error(layoutErrors.join('; '));
    }

    if (!measured.palettePanel) {
      throw new Error('workshop-palette-panel not measured');
    }

    const swatches = await page.$$('[data-testid="workshop-palette-panel"] img');
    if (swatches.length < 20) {
      throw new Error(`Expected palette swatches, found ${swatches.length}`);
    }

    writeWorkshopLayoutArtifact({
      screen: 'workshop-palette',
      measured,
      scale,
      swatches: swatches.length,
      capturedAt: new Date().toISOString(),
    }, 'workshop-palette-layout.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS workshop-palette.layout', { scale, swatches: swatches.length });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL workshop-palette.layout:', e.message);
  process.exit(1);
});