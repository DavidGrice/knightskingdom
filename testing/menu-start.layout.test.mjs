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
    const localTab = await page.$('[data-testid="world-tab-local"]');
    const sharedTab = await page.$('[data-testid="world-tab-shared"]');
    const localActiveBefore = await localTab.evaluate((el) => el.getAttribute('data-active'));
    if (localActiveBefore !== 'true') {
      throw new Error('Local tab should be active on load');
    }
    await sharedTab.click();
    const sharedActive = await sharedTab.evaluate((el) => el.getAttribute('data-active'));
    if (sharedActive !== 'true') {
      throw new Error('Shared tab should be active after click');
    }
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