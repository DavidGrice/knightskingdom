import { assertDevServerReady, launch } from '../../lib/driver.mjs';
import { gotoWorkshopWithBucket } from '../../lib/workshopDriver.mjs';
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
    await gotoWorkshopWithBucket(page);
    const { scale } = await assertWorkshopChromePresent(page);

    const measured = await measureWorkshopLayout(page);
    const layoutErrors = assertWorkshopLayoutContract(WORKSHOP_STAGE_METRICS, measured);
    if (layoutErrors.length > 0) {
      throw new Error(layoutErrors.join('; '));
    }

    if (!measured.bucketPanel) {
      throw new Error('workshop-bucket-panel not measured');
    }

    const cells = await page.$$('[data-testid="workshop-bucket-panel"] [class*="item"]');
    if (cells.length < 1) {
      throw new Error(`Expected workshop bucket grid cells, found ${cells.length}`);
    }

    writeWorkshopLayoutArtifact({
      screen: 'workshop-bucket',
      measured,
      scale,
      gridCells: cells.length,
      capturedAt: new Date().toISOString(),
    }, 'workshop-bucket-layout.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS workshop-bucket.layout', { scale, cells: cells.length });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL workshop-bucket.layout:', e.message);
  process.exit(1);
});