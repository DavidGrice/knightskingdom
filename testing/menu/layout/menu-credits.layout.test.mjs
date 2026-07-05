import { launch } from '../../lib/driver.mjs';
import { gotoCredits } from '../../lib/menuDriver.mjs';
import { assertMenuStagePresent, captureScreenshot } from '../../lib/menuLayoutAssert.mjs';
import {
  measureCreditsLayout,
  assertCreditsContract,
  writeScreenLayoutArtifact,
} from '../../lib/menuScreenLayoutAssert.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { buildCreditsLayoutContract } from '../../../src/Components/Common/MenuStageLayout/creditsLayoutMath.js';

const CONTRACT = buildCreditsLayoutContract();

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoCredits(page);
    const { scale } = await assertMenuStagePresent(page, { screenKey: 'CREDITS' });

    await page.waitForSelector('[data-testid="credits-scroll-panel"]');
    await page.waitForFunction(() => {
      const panel = document.querySelector('[data-testid="credits-scroll-panel"]');
      return panel && panel.querySelectorAll('[class*="textScrollTrack"]').length >= 2;
    }, { timeout: 5000 });

    const measured = await measureCreditsLayout(page);
    const layoutErrors = assertCreditsContract(CONTRACT, measured);
    if (layoutErrors.length > 0) {
      throw new Error(layoutErrors.join('; '));
    }

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    if (!checkmark) {
      throw new Error('Credits checkmark corner slot missing');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-credits');
    }

    writeScreenLayoutArtifact({
      screenKey: 'CREDITS',
      contract: CONTRACT,
      measured,
      scale,
      capturedAt: new Date().toISOString(),
    }, 'credits-layout-contract.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-credits.layout', {
      scrollDuration: measured.scrollDuration,
      scale,
    });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-credits.layout:', e.message);
  process.exit(1);
});