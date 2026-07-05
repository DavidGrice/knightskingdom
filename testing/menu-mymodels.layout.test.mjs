import { launch } from './lib/driver.mjs';
import { gotoMyModels } from './lib/menuDriver.mjs';
import { assertMenuStagePresent, assertPaginatedGrid, captureScreenshot } from './lib/menuLayoutAssert.mjs';

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoMyModels(page);

    // MyModels not yet on MenuStageLayout — test grid + holder until migrated
    const holder = await page.$('[class*="MyModelsHolder_componentHolder"]');
    if (!holder) {
      throw new Error('MyModels holder not found');
    }

    await assertPaginatedGrid(page, { minItems: 1, maxItems: 9 });

    const checkmark = await page.$('img[alt="Checkmark"]');
    if (!checkmark) {
      throw new Error('MyModels checkmark not found');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-mymodels');
    }

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-mymodels.layout');
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-mymodels.layout:', e.message);
  process.exit(1);
});