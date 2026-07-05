import { launch } from './lib/driver.mjs';
import { gotoSnapshot } from './lib/menuDriver.mjs';
import { assertPaginatedGrid, captureScreenshot } from './lib/menuLayoutAssert.mjs';

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoSnapshot(page);

    const holder = await page.$('[class*="SnapShotHolder_componentHolder"]');
    if (!holder) {
      throw new Error('SnapShot holder not found');
    }

    const box = await holder.boundingBox();
    if (!box || box.width < 400) {
      throw new Error(`SnapShot holder too small or unpositioned: ${JSON.stringify(box)}`);
    }

    await assertPaginatedGrid(page, { minItems: 1, maxItems: 9 });

    const checkmark = await page.$('img[alt="Checkmark"]');
    if (!checkmark) {
      throw new Error('SnapShot checkmark not found');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-snapshot');
    }

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-snapshot.layout');
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-snapshot.layout:', e.message);
  process.exit(1);
});