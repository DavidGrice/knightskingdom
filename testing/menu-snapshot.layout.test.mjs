import { launch } from './lib/driver.mjs';
import { gotoSnapshot } from './lib/menuDriver.mjs';
import { assertMenuStagePresent, assertPaginatedGrid, captureScreenshot } from './lib/menuLayoutAssert.mjs';

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoSnapshot(page);
    await assertMenuStagePresent(page, { screenKey: 'SNAPSHOT' });

    const panelShell = await page.$('[data-testid="menu-panel-shell"]');
    if (!panelShell) {
      throw new Error('SnapShot MenuPanelShell not found');
    }

    const holder = await page.$('[data-testid="menu-panel-holder"]');
    if (!holder) {
      throw new Error('SnapShot panel holder not found');
    }

    const box = await holder.boundingBox();
    if (!box || box.width < 350) {
      throw new Error(`SnapShot holder too small or unpositioned: ${JSON.stringify(box)}`);
    }

    await assertPaginatedGrid(page, { minItems: 1, maxItems: 9 });

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    if (!checkmark) {
      throw new Error('SnapShot checkmark corner slot missing');
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