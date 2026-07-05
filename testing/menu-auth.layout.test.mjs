import { launch } from './lib/driver.mjs';
import { gotoAuthentication } from './lib/menuDriver.mjs';
import { assertMenuStagePresent, captureScreenshot } from './lib/menuLayoutAssert.mjs';

const ROW_W = 528;
const ROW_H = 90;

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoAuthentication(page);
    const { scale, rect: stageRect } = await assertMenuStagePresent(page, {
      screenKey: 'AUTHENTICATION',
    });

    const layout = await page.evaluate(() => {
      const stage = document.querySelector('[data-testid="menu-stage"]');
      const rows = [...document.querySelectorAll('[data-testid="profile-row"]')];
      const stageR = stage?.getBoundingClientRect();
      return rows.map((row) => {
        const r = row.getBoundingClientRect();
        const sprite = row.querySelector('img');
        const name = row.querySelector('[class*="profileDiv"], input');
        const sr = sprite?.getBoundingClientRect();
        const nr = name?.getBoundingClientRect();
        return {
          row: { w: r.width, h: r.height, x: r.x - stageR.x, y: r.y - stageR.y },
          sprite: sr ? { w: sr.width, h: sr.height } : null,
          name: nr ? { text: name.value ?? name.textContent, x: nr.x - r.x } : null,
        };
      });
    });

    if (layout.length < 1) {
      throw new Error('No profile rows found');
    }

    for (const row of layout) {
      const w = row.sprite?.w ?? row.row.w;
      const h = row.sprite?.h ?? row.row.h;
      if (Math.abs(w - ROW_W * scale) > 6 || Math.abs(h - ROW_H * scale) > 6) {
        throw new Error(
          `Profile sprite size drift: ${w.toFixed(0)}×${h.toFixed(0)} `
          + `(expected ~${(ROW_W * scale).toFixed(0)}×${(ROW_H * scale).toFixed(0)})`,
        );
      }
      if (row.name && row.name.x < 80 * scale) {
        throw new Error(`Name "${row.name.text}" too far left (x=${row.name.x.toFixed(0)} within row)`);
      }
    }

    const stageHandle = await page.$('[data-testid="menu-stage"]');
    const firstRowHandle = await page.$('[data-testid="profile-row"]');
    const stageBox = await stageHandle.boundingBox();
    const rowBox = await firstRowHandle.boundingBox();
    const listX = (rowBox.x - stageBox.x) / scale;
    if (listX < 130 || listX > 220) {
      throw new Error(`Profile list X drift: ${listX.toFixed(0)}px on 800×600 canvas (want 150–210)`);
    }

    const scaleMode = await page.$eval('[data-testid="menu-root"]', (el) => el.getAttribute('data-scale-mode'));
    if (scaleMode !== 'modern') {
      throw new Error(`Expected modern scale mode on auth, got "${scaleMode}"`);
    }

    const stackCenterY = (rowBox.y + rowBox.height / 2 - stageBox.y) / scale;
    if (stackCenterY > 280) {
      throw new Error(`Profile stack too low: center Y=${stackCenterY.toFixed(0)} (want < 280 on 600px canvas)`);
    }

    const rows = await page.$$('[data-testid="profile-row"]');
    const lastRow = rows[rows.length - 1];
    const lastBox = await lastRow.boundingBox();
    const stageBottom = stageBox.y + stageBox.height;
    if (lastBox.y + lastBox.height > stageBottom + 2) {
      throw new Error('Last profile row extends below stage (Emma clip)');
    }

    const checkmark = await page.$('[data-testid="menu-corner-checkmark"]');
    const trash = await page.$('[data-testid="menu-corner-trash"]');
    if (!checkmark || !trash) {
      throw new Error('Auth corners: checkmark or trash slot missing');
    }

    await captureScreenshot(page, 'auth-fixed');

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length > 0) {
      throw new Error(`Console errors: ${realErrors.join('; ')}`);
    }

    console.log('PASS menu-auth.layout', { rows: layout.length, scale, stageRect });
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error('FAIL menu-auth.layout:', e.message);
  process.exit(1);
});