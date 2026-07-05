import { launch } from '../../lib/driver.mjs';
import { gotoMainMenu } from '../../lib/menuDriver.mjs';
import { assertMenuStagePresent, captureScreenshot } from '../../lib/menuLayoutAssert.mjs';
import {
  measureMainMenuButtons,
  assertMainMenuContract,
  writeScreenLayoutArtifact,
} from '../../lib/menuScreenLayoutAssert.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { MENU_SCREEN_METRICS } from '../../../src/Components/Common/MenuStageLayout/menuStageMetrics.js';

const METRICS = MENU_SCREEN_METRICS.MAIN_MENU;

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoMainMenu(page);
    const { scale } = await assertMenuStagePresent(page, { screenKey: 'MAIN_MENU' });

    const measured = await measureMainMenuButtons(page);
    const layoutErrors = assertMainMenuContract(METRICS, measured);
    if (layoutErrors.length > 0) {
      throw new Error(layoutErrors.join('; '));
    }

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    const trash = await page.$('[data-testid="menu-corner-trash"]');
    if (checkmark || trash) {
      throw new Error('Main menu should not expose corner checkmark/trash slots');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-mainmenu');
    }

    writeScreenLayoutArtifact({
      screenKey: 'MAIN_MENU',
      metrics: METRICS,
      measured,
      scale,
      capturedAt: new Date().toISOString(),
    }, 'mainmenu-layout-contract.json');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-mainmenu.layout', { buttons: measured.buttons.length, scale });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-mainmenu.layout:', e.message);
  process.exit(1);
});