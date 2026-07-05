/**
 * Workshop route smoke — enter from main game, exercise bucket/palette, return.
 */
import { assertDevServerReady, launch } from '../../lib/driver.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { TEST_ROUTES } from '../../lib/testRoutes.mjs';
import {
  gotoWorkshop,
  openWorkshopBucket,
  openWorkshopPalette,
} from '../../lib/workshopDriver.mjs';
import { assertWorkshopChromePresent } from '../../lib/workshopLayoutAssert.mjs';

const WORKSHOP_PATH = TEST_ROUTES.startStack.workshop;
const MAIN_GAME_PATH = TEST_ROUTES.startStack.mainGame;

const main = async () => {
  await assertDevServerReady();
  const { browser, page, errors } = await launch();

  try {
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Phase 1 — enter workshop from main game');
    await gotoWorkshop(page);
    await assertWorkshopChromePresent(page);
    if (!page.url().includes(WORKSHOP_PATH)) {
      throw new Error(`Expected URL containing ${WORKSHOP_PATH}, got ${page.url()}`);
    }
    console.log(`  OK workshop route ${WORKSHOP_PATH}`);

    console.log('Phase 2 — bucket + palette panels');
    await openWorkshopBucket(page);
    const bucket = await page.$('[data-testid="workshop-bucket-panel"]');
    if (!bucket) {
      throw new Error('workshop-bucket-panel missing after toolbar click');
    }
    console.log('  OK bucket panel open');

    await page.click('[data-testid="workshop-toolbar-bucket"]');
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="workshop-bucket-panel"]'),
      { timeout: 5000 },
    );

    await openWorkshopPalette(page);
    const palette = await page.$('[data-testid="workshop-palette-panel"]');
    if (!palette) {
      throw new Error('workshop-palette-panel missing after toolbar click');
    }
    console.log('  OK palette panel open');

    console.log('Phase 3 — leave back to main game');
    const leave = await page.$('[data-testid="game-shell-top"][data-mode="workshop"] [class*="goodBye"]');
    if (!leave) {
      throw new Error('workshop leave button not found');
    }
    await leave.click();
    await page.waitForFunction(
      (path) => window.location.pathname.includes(path),
      { timeout: 15000 },
      MAIN_GAME_PATH,
    );
    if (!page.url().includes(MAIN_GAME_PATH)) {
      throw new Error(`Expected return to ${MAIN_GAME_PATH}, got ${page.url()}`);
    }
    console.log(`  OK returned to ${MAIN_GAME_PATH}`);

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS workshop-routes.smoke', { navSteps: 4 });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL workshop-routes.smoke:', e.message);
  process.exit(1);
});