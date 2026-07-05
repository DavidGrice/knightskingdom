import { launch } from '../../lib/driver.mjs';
import { assertMenuStagePresent } from '../../lib/menuLayoutAssert.mjs';
import { computeExpectedMenuScale } from '../../lib/authLayoutAssert.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import {
  SCALE_MATRIX_SCREENS,
  SCALE_MATRIX_VIEWPORTS,
  assertScaleMatrixSanity,
} from '../../lib/menuScaleMatrix.mjs';
import { writeScreenLayoutArtifact } from '../../lib/menuScreenLayoutAssert.mjs';

const SCALE_TOLERANCE = 0.02;

const main = async () => {
  const { browser, page, errors } = await launch();
  const matrix = [];

  try {
    for (const screen of SCALE_MATRIX_SCREENS) {
      for (const vp of SCALE_MATRIX_VIEWPORTS) {
        await page.setViewport({ width: vp.width, height: vp.height });
        await screen.goto(page);

        const { scale, rect } = await assertMenuStagePresent(page, {
          screenKey: screen.screenKey,
        });
        const expectedScale = computeExpectedMenuScale(vp.width, vp.height);

        if (Math.abs(scale - expectedScale) > SCALE_TOLERANCE) {
          throw new Error(
            `${screen.label}/${vp.label}: --msl-scale ${scale.toFixed(3)} `
            + `!= expected ${expectedScale.toFixed(3)}`,
          );
        }

        await assertScaleMatrixSanity(page, screen.screenKey);

        const scaleMode = await page.$eval(
          '[data-testid="menu-root"]',
          (el) => el.getAttribute('data-scale-mode'),
        );

        matrix.push({
          screenKey: screen.screenKey,
          screen: screen.label,
          viewport: vp.label,
          scale,
          expectedScale,
          scaleMode,
          stageWidth: rect.width,
          stageHeight: rect.height,
        });

        console.log(
          `  OK ${screen.label}/${vp.label} scale=${scale.toFixed(3)} mode=${scaleMode}`,
        );
      }
    }

    writeScreenLayoutArtifact({
      matrix,
      screens: SCALE_MATRIX_SCREENS.length,
      viewports: SCALE_MATRIX_VIEWPORTS.length,
      capturedAt: new Date().toISOString(),
    }, 'menu-scale-matrix.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-scale-matrix', {
      cases: matrix.length,
      screens: SCALE_MATRIX_SCREENS.length,
      viewports: SCALE_MATRIX_VIEWPORTS.length,
    });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-scale-matrix:', e.message);
  process.exit(1);
});