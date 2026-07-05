/**
 * Regression: world template maps should not render as a near-black framebuffer.
 * Detects the unsolved template-01…09 OBJ/MTL black-render issue from CHANGELOG 2026-07-02.
 *
 * Usage: node testing/template-map-render.test.mjs [worldIndex]
 *   worldIndex 0-based (omit to test worlds 1–9)
 */
import { assertDevServerReady, launch, seedAuth, selectWorld, waitForMapLoad } from './lib/driver.mjs';
import { sampleCanvasLuminance } from './lib/canvasSample.mjs';

const MIN_AVG_LUMINANCE = 18;
const MAX_DARK_RATIO = 0.92;
const WORLD_COUNT = 9;

const testWorldRender = async (worldIndex) => {
  const { browser, page, errors } = await launch();
  try {
    await page.setViewport({ width: 1280, height: 800 });
    await seedAuth(page);
    await selectWorld(page, worldIndex);
    await waitForMapLoad(page, 10000);
    await new Promise((r) => setTimeout(r, 1500));

    const sample = await sampleCanvasLuminance(page);
    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));

    return {
      worldIndex,
      worldNumber: worldIndex + 1,
      sample,
      errors: realErrors,
    };
  } finally {
    await browser.close();
  }
};

const main = async () => {
  await assertDevServerReady();

  const only = process.argv[2] !== undefined ? Number(process.argv[2]) : null;
  const indices = only !== null ? [only] : Array.from({ length: WORLD_COUNT }, (_, i) => i);

  console.log(`Template map render check — worlds: ${indices.map((i) => i + 1).join(', ')}`);

  let failures = 0;
  for (const worldIndex of indices) {
    // eslint-disable-next-line no-await-in-loop
    const result = await testWorldRender(worldIndex);
    const { sample, errors } = result;

    if (errors.length > 0) {
      failures += 1;
      console.log(`World ${result.worldNumber}: FAIL (console errors)`);
      errors.forEach((e) => console.log(`  ${e}`));
      continue;
    }

    if (sample.error) {
      failures += 1;
      console.log(`World ${result.worldNumber}: FAIL (${sample.error})`);
      continue;
    }

    const tooDark = sample.avgLum < MIN_AVG_LUMINANCE || sample.darkRatio > MAX_DARK_RATIO;
    if (tooDark) {
      failures += 1;
      console.log(
        `World ${result.worldNumber}: FAIL black-render `
        + `(avgLum=${sample.avgLum.toFixed(1)}, darkRatio=${(sample.darkRatio * 100).toFixed(1)}%)`,
      );
      continue;
    }

    console.log(
      `World ${result.worldNumber}: PASS `
      + `(avgLum=${sample.avgLum.toFixed(1)}, darkRatio=${(sample.darkRatio * 100).toFixed(1)}%)`,
    );
  }

  if (failures > 0) {
    process.exit(1);
  }
  console.log(`\n${indices.length} world(s) passed render check`);
};

main().catch((e) => {
  console.error('FAIL template-map-render:', e.message);
  process.exit(1);
});