import { launch } from '../../lib/driver.mjs';
import { gotoAuthenticationWithProfiles } from '../../lib/menuDriver.mjs';
import { assertMenuStagePresent } from '../../lib/menuLayoutAssert.mjs';
import {
  measureAuthLayout,
  assertAuthLayoutContract,
  writeAuthLayoutArtifact,
  computeExpectedMenuScale,
} from '../../lib/authLayoutAssert.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { buildAuthLayoutContract } from '../../../src/Components/Common/MenuStageLayout/authLayoutContract.js';

const CONTRACT = buildAuthLayoutContract();

const VIEWPORTS = [
  { width: 1280, height: 800, label: 'desktop-1280' },
  { width: 1920, height: 1080, label: 'desktop-1920' },
  { width: 1024, height: 768, label: 'desktop-1024' },
  { width: 375, height: 667, label: 'mobile-375' },
  { width: 2560, height: 1440, label: 'desktop-2560' },
];

const main = async () => {
  const { browser, page, errors } = await launch();
  const results = [];

  try {
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await gotoAuthenticationWithProfiles(page);

      const { scale } = await assertMenuStagePresent(page, { screenKey: 'AUTHENTICATION' });
      const expectedScale = computeExpectedMenuScale(vp.width, vp.height);

      if (Math.abs(scale - expectedScale) > 0.02) {
        throw new Error(
          `${vp.label}: --msl-scale ${scale.toFixed(3)} != expected ${expectedScale.toFixed(3)}`,
        );
      }

      const measured = await measureAuthLayout(page);
      const layoutErrors = assertAuthLayoutContract(CONTRACT, measured, { tolerance: 14 });
      if (layoutErrors.length > 0) {
        throw new Error(`${vp.label}: ${layoutErrors.join('; ')}`);
      }

      results.push({
        viewport: vp,
        scale,
        expectedScale,
        rowCount: measured.rows.length,
      });

      console.log(`  OK ${vp.label} scale=${scale.toFixed(3)} rows=${measured.rows.length}`);
    }

    writeAuthLayoutArtifact({
      contract: CONTRACT,
      matrix: results,
      capturedAt: new Date().toISOString(),
    }, 'auth-layout-scale-matrix.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-auth.scale-matrix', { viewports: VIEWPORTS.length });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-auth.scale-matrix:', e.message);
  process.exit(1);
});