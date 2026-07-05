/**
 * Workshop challenge smoke — select a tutorial from bucket tab 9, instructions panel appears.
 */
import { assertDevServerReady, launch } from '../../lib/driver.mjs';
import { filterConsoleErrors } from '../../lib/holderLayoutAssert.mjs';
import { openWorkshopChallenge } from '../../lib/workshopDriver.mjs';

const CHALLENGE_ID = 'c5-stacked-wall';

const main = async () => {
  await assertDevServerReady();
  const { browser, page, errors } = await launch();

  try {
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Phase 1 — open stacked wall challenge');
    await openWorkshopChallenge(page, CHALLENGE_ID);

    const title = await page.$eval(
      '[data-testid="workshop-instructions-panel"] h3',
      (el) => el.textContent?.trim() ?? '',
    );
    if (!title.includes('Stacked')) {
      throw new Error(`Expected challenge title containing "Stacked", got "${title}"`);
    }

    const progress = await page.$eval(
      '[data-testid="workshop-challenge-progress"]',
      (el) => el.textContent?.trim() ?? '',
    );
    if (!progress.includes('0 / 2')) {
      throw new Error(`Expected initial progress "0 / 2", got "${progress}"`);
    }

    const bucketClosed = await page.$('[data-testid="workshop-bucket-panel"]') === null;
    if (!bucketClosed) {
      throw new Error('Bucket should close after challenge select');
    }

    const preview = await page.$('[data-testid="workshop-instructions-preview"]');
    if (!preview) {
      throw new Error('Step preview missing on first step');
    }
    console.log('  OK step 1 preview visible');

    console.log('Phase 2 — step through visual guide');
    await page.click('[data-testid="workshop-instructions-step-next"]');
    await page.waitForFunction(
      () => document.querySelector('[data-testid="workshop-instructions-step-counter"]')?.textContent?.includes('2 / 3'),
      { timeout: 3000 },
    );
    const buildPreview = await page.$('[data-testid="workshop-instructions-preview"] [data-brick-id="c5_2x4"]');
    if (!buildPreview) {
      throw new Error('Step 2 build preview missing c5_2x4 thumb');
    }
    await page.click('[data-testid="workshop-instructions-step-next"]');
    const stackLayout = await page.$eval(
      '[data-testid="workshop-instructions-preview"] [data-layout="stack"]',
      (el) => el.querySelectorAll('[data-brick-id]').length,
    );
    if (stackLayout !== 2) {
      throw new Error(`Expected 2 bricks in stack preview, got ${stackLayout}`);
    }
    console.log('  OK step navigation + stack preview');

    console.log('Phase 3 — dismiss challenge');
    const dismissed = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('[data-testid="workshop-instructions-panel"] button')];
      const dismiss = buttons.find((btn) => btn.textContent?.trim() === 'Dismiss');
      if (!dismiss) {
        return false;
      }
      dismiss.click();
      return true;
    });
    if (!dismissed) {
      throw new Error('Dismiss button not found');
    }
    await page.waitForFunction(
      () => !document.querySelector('[data-testid="workshop-instructions-panel"]'),
      { timeout: 5000 },
    );
    console.log('  OK challenge dismissed');

    const realErrors = filterConsoleErrors(errors);
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS workshop-challenges.smoke', { challengeId: CHALLENGE_ID });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL workshop-challenges.smoke:', e.message);
  process.exit(1);
});