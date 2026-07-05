/**
 * Capture authentication screen for visual comparison.
 * Usage: TEST_CAPTURE=1 node testing/capture-auth.probe.mjs
 */
import { launch } from './lib/driver.mjs';
import { gotoAuthentication } from './lib/menuDriver.mjs';
import { captureScreenshot, readStageRect } from './lib/menuLayoutAssert.mjs';
import fs from 'fs';
import path from 'path';

const main = async () => {
  const { browser, page, errors } = await launch();
  try {
    await gotoAuthentication(page);

    const stageRect = await readStageRect(page);
    const profileRows = await page.evaluate(() => {
      const icons = [...document.querySelectorAll('[class*="profileIcon"] img')];
      const names = [...document.querySelectorAll('[class*="profileDiv"], [class*="profileInput"]')];
      const map = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height, text: el.value || el.textContent };
      };
      return {
        icons: icons.map(map),
        names: names.map(map),
        stage: document.querySelector('[data-testid="menu-stage"]')?.getBoundingClientRect(),
      };
    });

    const outDir = path.join(process.cwd(), 'testing', 'output');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'auth-layout-debug.json'),
      JSON.stringify({ stageRect, profileRows }, null, 2),
    );

    const shot = await captureScreenshot(page, 'auth-modern-scale');
    console.log('Screenshot:', shot);
    console.log('Layout debug:', path.join(outDir, 'auth-layout-debug.json'));
    console.log(JSON.stringify(profileRows, null, 2));

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length) {
      console.warn('Errors:', realErrors);
    }
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});