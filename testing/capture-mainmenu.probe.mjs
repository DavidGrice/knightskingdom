import { launch } from './lib/driver.mjs';
import { seedAuth } from './lib/driver.mjs';
import { captureScreenshot } from './lib/menuLayoutAssert.mjs';

const main = async () => {
  const { browser, page } = await launch();
  try {
    await seedAuth(page);
    await page.goto('http://localhost:3000/main-menu', { waitUntil: 'networkidle0' });
    const shot = await captureScreenshot(page, 'main-menu-debug');
    console.log('Screenshot:', shot);
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});