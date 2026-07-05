import { assertDevServerReady, launch } from '../../lib/driver.mjs';
import { gotoWorkshop } from '../../lib/workshopDriver.mjs';
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
    await gotoWorkshop(page);
    const { scale } = await assertWorkshopChromePresent(page);

    const measured = await measureWorkshopLayout(page);
    const layoutErrors = assertWorkshopLayoutContract(WORKSHOP_STAGE_METRICS, measured);
    if (layoutErrors.length > 0) {
      throw new Error(layoutErrors.join('; '));
    }

    const bucketOpen = await page.$('[data-testid="workshop-bucket-panel"]');
    const paletteOpen = await page.$('[data-testid="workshop-palette-panel"]');
    if (bucketOpen || paletteOpen) {
      throw new Error('Default workshop should not show bucket or palette panels');
    }

    writeWorkshopLayoutArtifact({
      screen: 'workshop-default',
      metrics: WORKSHOP_STAGE_METRICS,
      measured,
      scale,
      capturedAt: new Date().toISOString(),
    }, 'workshop-default-layout.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS workshop-default.layout', { scale });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL workshop-default.layout:', e.message);
  process.exit(1);
});