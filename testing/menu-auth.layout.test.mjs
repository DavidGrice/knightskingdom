import { launch } from './lib/driver.mjs';
import { gotoAuthenticationWithProfiles } from './lib/menuDriver.mjs';
import { assertMenuStagePresent, captureScreenshot } from './lib/menuLayoutAssert.mjs';
import {
  measureAuthLayout,
  assertAuthLayoutContract,
  writeAuthLayoutArtifact,
} from './lib/authLayoutAssert.mjs';
import { buildAuthLayoutContract } from '../src/Components/Common/MenuStageLayout/authLayoutContract.js';

const CONTRACT = buildAuthLayoutContract();

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoAuthenticationWithProfiles(page);
    const { scale, rect: stageRect } = await assertMenuStagePresent(page, {
      screenKey: 'AUTHENTICATION',
    });

    const measured = await measureAuthLayout(page);
    const layoutErrors = assertAuthLayoutContract(CONTRACT, measured);
    if (layoutErrors.length > 0) {
      throw new Error(layoutErrors.join('; '));
    }

    const input = await page.$('[data-testid="profile-name-input"]');
    if (!input) {
      throw new Error('profile-name-input not found');
    }

    const maxLen = CONTRACT.nameField.maxLength;
    const fill = 'n'.repeat(maxLen);
    await input.click({ clickCount: 3 });
    await input.type(fill);

    const overflow = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="profile-name-input"]');
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        valueLength: el.value.length,
        maxLength: el.maxLength,
      };
    });

    if (overflow.valueLength !== maxLen) {
      throw new Error(`Expected ${maxLen} chars in input, got ${overflow.valueLength}`);
    }
    if (overflow.scrollWidth > overflow.clientWidth + 2) {
      throw new Error(
        `Name overflows field: scroll ${overflow.scrollWidth.toFixed(1)} `
        + `> client ${overflow.clientWidth.toFixed(1)}`,
      );
    }

    const artifact = writeAuthLayoutArtifact({
      contract: CONTRACT,
      measured,
      viewport: { width: 1280, height: 800 },
      scale,
      overflow,
      capturedAt: new Date().toISOString(),
    });

    await captureScreenshot(page, 'auth-contract');

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-auth.layout', {
      rows: measured.rows.length,
      scale,
      maxLength: maxLen,
      artifact,
      stageRect,
    });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-auth.layout:', e.message);
  process.exit(1);
});