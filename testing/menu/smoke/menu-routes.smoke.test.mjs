/**
 * P4 — Menu route smoke: every screen mounts MenuStageLayout with correct data-screen,
 * URLs match canonical routes, and click-through navigation works without console errors.
 */
import { launch } from '../../lib/driver.mjs';
import { gotoAuthenticationWithProfiles } from '../../lib/menuDriver.mjs';
import { assertMenuStagePresent } from '../../lib/menuLayoutAssert.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { SCALE_MATRIX_SCREENS } from '../../lib/menuScaleMatrix.mjs';
import { ROUTES } from '../../../src/lib/routes.js';

/** Expected pathname suffix per screenKey (from routes.js). */
const ROUTE_PATHS = {
  AUTHENTICATION: ROUTES.authentication,
  MAIN_MENU: ROUTES.mainMenu,
  OPTIONS: ROUTES.options,
  CREDITS: ROUTES.credits,
  START_WORLD: ROUTES.startStack.start,
  MY_MODELS: ROUTES.startStack.myModels,
  SNAPSHOT: ROUTES.startStack.snapshot,
};

const WAIT_MS = 12000;

/** @param {import('puppeteer').Page} page */
const waitForMenuScreen = async (page, screenKey, label = screenKey) => {
  try {
    await page.waitForFunction(
      (key) => {
        const stage = document.querySelector('[data-testid="menu-stage"]');
        return stage?.getAttribute('data-screen') === key;
      },
      { timeout: WAIT_MS },
      screenKey,
    );
  } catch {
    const actual = await page.$eval('[data-testid="menu-stage"]', (el) => el.getAttribute('data-screen')).catch(() => null);
    throw new Error(`Timed out waiting for ${label} (data-screen="${screenKey}"), got "${actual}" at ${page.url()}`);
  }
};

/** @param {import('puppeteer').Page} page */
const assertRouteSmoke = async (page, { screenKey, label }) => {
  await waitForMenuScreen(page, screenKey, label);
  await assertMenuStagePresent(page, { screenKey });

  const root = await page.$('[data-testid="menu-root"]');
  const scaler = await page.$('[data-testid="menu-scaler"]');
  if (!root || !scaler) {
    throw new Error(`${label}: menu-root or menu-scaler missing`);
  }

  const path = ROUTE_PATHS[screenKey];
  const url = page.url();
  if (!url.includes(path)) {
    throw new Error(`${label}: expected URL containing "${path}", got ${url}`);
  }
};

/** @param {import('puppeteer').Page} page */
const clickProfileByName = async (page, name) => {
  const clicked = await page.evaluate((profileName) => {
    const rows = [...document.querySelectorAll('[data-testid="profile-row"]')];
    const row = rows.find((el) => el.textContent.includes(profileName));
    if (!row) {
      return false;
    }
    row.click();
    return true;
  }, name);
  if (!clicked) {
    throw new Error(`Profile row "${name}" not found`);
  }
};

/** @param {import('puppeteer').Page} page */
const clickMenuButton = async (page, altText) => {
  const handle = await page.$(`img[alt="${altText}"]`);
  if (!handle) {
    throw new Error(`Menu button img[alt="${altText}"] not found`);
  }
  await handle.click();
};

/** @param {import('puppeteer').Page} page */
const clickBackCheckmark = async (page) => {
  const handle = await page.$('[data-testid="menu-corner-checkmark"]');
  if (!handle) {
    throw new Error('menu-corner-checkmark not found');
  }
  await handle.click();
};

const main = async () => {
  const { browser, page, errors } = await launch();

  try {
    console.log('Phase 1 — direct route visits');
    for (const screen of SCALE_MATRIX_SCREENS) {
      // eslint-disable-next-line no-await-in-loop
      await screen.goto(page);
      // eslint-disable-next-line no-await-in-loop
      await assertRouteSmoke(page, screen);
      console.log(`  OK ${screen.label} → ${ROUTE_PATHS[screen.screenKey]}`);
    }

    console.log('Phase 2 — click-through navigation');
    await gotoAuthenticationWithProfiles(page);
    await assertRouteSmoke(page, { screenKey: 'AUTHENTICATION', label: 'auth' });

    await clickProfileByName(page, 'David');
    await clickBackCheckmark(page);
    await assertRouteSmoke(page, { screenKey: 'MAIN_MENU', label: 'main-menu' });

    await clickMenuButton(page, 'Options');
    await assertRouteSmoke(page, { screenKey: 'OPTIONS', label: 'options' });

    await clickBackCheckmark(page);
    await assertRouteSmoke(page, { screenKey: 'MAIN_MENU', label: 'main-menu' });

    await clickMenuButton(page, 'Credits');
    await assertRouteSmoke(page, { screenKey: 'CREDITS', label: 'credits' });

    await clickBackCheckmark(page);
    await assertRouteSmoke(page, { screenKey: 'MAIN_MENU', label: 'main-menu' });

    await clickMenuButton(page, 'Start');
    await assertRouteSmoke(page, { screenKey: 'START_WORLD', label: 'start-world' });

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-routes.smoke', {
      directRoutes: SCALE_MATRIX_SCREENS.length,
      navSteps: 8,
    });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-routes.smoke:', e.message);
  process.exit(1);
});