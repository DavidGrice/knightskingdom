import { launch } from '../../lib/driver.mjs';
import { gotoOptions } from '../../lib/menuDriver.mjs';
import { assertMenuStagePresent, captureScreenshot } from '../../lib/menuLayoutAssert.mjs';
import {
  measureOptionsLayout,
  assertOptionsContract,
  writeScreenLayoutArtifact,
} from '../../lib/menuScreenLayoutAssert.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { buildOptionsLayoutContract } from '../../../src/Components/Common/MenuStageLayout/optionsLayoutMath.js';
import { MENU_SCREEN_METRICS } from '../../../src/Components/Common/MenuStageLayout/menuStageMetrics.js';

const CONTRACT = buildOptionsLayoutContract();
const METRICS = MENU_SCREEN_METRICS.OPTIONS;

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoOptions(page);
    const { scale } = await assertMenuStagePresent(page, { screenKey: 'OPTIONS' });

    const measured = await measureOptionsLayout(page);
    const layoutErrors = assertOptionsContract(CONTRACT, METRICS, measured);
    if (layoutErrors.length > 0) {
      throw new Error(layoutErrors.join('; '));
    }

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    if (!checkmark) {
      throw new Error('Options checkmark corner slot missing');
    }

    const helpCorner = await page.$('[data-testid="menu-corner-trash"]');
    if (!helpCorner) {
      throw new Error('Options Richard help corner slot missing');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-options');
    }

    writeScreenLayoutArtifact({
      screenKey: 'OPTIONS',
      contract: CONTRACT,
      measured,
      scale,
      capturedAt: new Date().toISOString(),
    }, 'options-layout-contract.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-options.layout', { rows: measured.rows.length, scale });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-options.layout:', e.message);
  process.exit(1);
});