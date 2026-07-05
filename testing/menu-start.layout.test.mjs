import { launch } from './lib/driver.mjs';
import { gotoWorldPicker } from './lib/menuDriver.mjs';
import {
  assertMenuStagePresent,
  assertDualHeader,
  assertPaginatedGrid,
  captureScreenshot,
} from './lib/menuLayoutAssert.mjs';

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoWorldPicker(page);
    await assertMenuStagePresent(page, { screenKey: 'START_WORLD' });
    await assertDualHeader(page);
    await assertPaginatedGrid(page, { minItems: 9, maxItems: 9 });

    const leave = await page.$('[data-testid="menu-corner-leave"]');
    if (!leave) {
      throw new Error('Start screen: leave corner slot missing');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-start-local');
    }

    // Toggle to shared worlds tab
    const sharedTab = await page.$('[class*="sharedWorldsHeader"]');
    await sharedTab.click();
    await new Promise((r) => setTimeout(r, 500));

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-start-shared');
    }

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-start.layout');
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-start.layout:', e.message);
  process.exit(1);
});