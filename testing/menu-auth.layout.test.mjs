import { launch } from './lib/driver.mjs';
import { gotoAuthentication } from './lib/menuDriver.mjs';
import { assertMenuStagePresent, captureScreenshot } from './lib/menuLayoutAssert.mjs';

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoAuthentication(page);
    await assertMenuStagePresent(page, { screenKey: 'AUTHENTICATION' });

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    const trash = await page.$('[data-testid="menu-corner-trash"]');
    if (!checkmark || !trash) {
      throw new Error('Auth corners: checkmark or trash slot missing');
    }

    if (process.env.TEST_CAPTURE) {
      await captureScreenshot(page, 'menu-auth');
    }

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-auth.layout');
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-auth.layout:', e.message);
  process.exit(1);
});