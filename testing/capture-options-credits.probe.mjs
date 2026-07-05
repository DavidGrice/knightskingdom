import { launch, seedAuth } from './lib/driver.mjs';
import { captureScreenshot } from './lib/menuLayoutAssert.mjs';

const main = async () => {
  const { browser, page } = await launch();
  try {
    await seedAuth(page);
    await page.goto('http://localhost:3000/options', { waitUntil: 'networkidle0' });
    console.log('Options:', await captureScreenshot(page, 'options-debug'));

    await page.goto('http://localhost:3000/credits', { waitUntil: 'networkidle0' });
    console.log('Credits:', await captureScreenshot(page, 'credits-debug'));
  } finally {
    await browser.close();
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});