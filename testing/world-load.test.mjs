import { launch, seedAuth, selectWorld, waitForMapLoad, BASE_URL } from './lib/driver.mjs';

/**
 * Regression check: every one of the 10 world slots loads
 * /start-stack/main-game with no console errors, no failed asset requests.
 * Catches map-loading, placement-spawning, and asset-path regressions
 * without needing a fresh puppeteer script written per session.
 *
 * Requires the dev server running at TEST_BASE_URL (default localhost:3000).
 * Usage: node testing/world-load.test.mjs [worldIndex]
 *   (omit worldIndex to test all 10 worlds)
 */

const WORLD_COUNT = 10;

const testWorld = async (worldIndex) => {
    const { browser, page, errors } = await launch();
    try {
        await seedAuth(page);
        await selectWorld(page, worldIndex);
        await waitForMapLoad(page);

        const onMainGame = page.url().includes('/start-stack/main-game');
        const realErrors = errors.filter((e) => !e.includes('favicon.ico'));

        return { worldIndex, onMainGame, errors: realErrors };
    } finally {
        await browser.close();
    }
};

const main = async () => {
    const only = process.argv[2] !== undefined ? Number(process.argv[2]) : null;
    const indices = only !== null ? [only] : Array.from({ length: WORLD_COUNT }, (_, i) => i);

    console.log(`Testing against ${BASE_URL} -- worlds: ${indices.join(', ')}`);

    let failures = 0;
    for (const worldIndex of indices) {
        // eslint-disable-next-line no-await-in-loop
        const result = await testWorld(worldIndex);
        const pass = result.onMainGame && result.errors.length === 0;
        console.log(`World ${worldIndex + 1}: ${pass ? 'PASS' : 'FAIL'}`);
        if (!pass) {
            failures += 1;
            if (!result.onMainGame) console.log('  did not reach /start-stack/main-game');
            result.errors.forEach((e) => console.log(`  ${e}`));
        }
    }

    console.log(`\n${indices.length - failures}/${indices.length} worlds passed`);
    process.exit(failures > 0 ? 1 : 0);
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
