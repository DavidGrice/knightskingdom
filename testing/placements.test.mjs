import { launch, seedAuth, selectWorld, waitForMapLoad, NAMED_TEMPLATE_CHARACTERS } from './lib/driver.mjs';

/**
 * Regression check for the semi-vanilla placement pipeline: confirms known
 * tier-1 (named) placements actually spawn in the live scene, using the
 * window.__placedObjects test hook MapPlacementsLoader.jsx populates on
 * successful spawn (see that file). Guards against silent spawn failures
 * that wouldn't show up as console errors -- e.g. a catalog lookup miss.
 *
 * Requires the dev server running. Usage: node testing/placements.test.mjs
 */

const testWorldPlacement = async (worldIndex, expected) => {
    const { browser, page, errors } = await launch();
    try {
        await seedAuth(page);
        await selectWorld(page, worldIndex);
        await waitForMapLoad(page);

        const placed = await page.evaluate(() => window.__placedObjects || []);
        const found = placed.find((p) => p.matchedModelId === expected.matchedModelId);

        return { worldIndex, expected, placed, found: Boolean(found), errors };
    } finally {
        await browser.close();
    }
};

const main = async () => {
    let failures = 0;

    for (const [worldIndex, expected] of Object.entries(NAMED_TEMPLATE_CHARACTERS)) {
        // eslint-disable-next-line no-await-in-loop
        const result = await testWorldPlacement(Number(worldIndex), expected);
        const pass = result.found;
        console.log(`World ${Number(worldIndex) + 1} (${expected.templateId}) expects `
            + `${expected.matchedModelId}: ${pass ? 'PASS' : 'FAIL'}`);
        if (!pass) {
            failures += 1;
            console.log(`  spawned objects: ${JSON.stringify(result.placed)}`);
        }
    }

    console.log(`\n${Object.keys(NAMED_TEMPLATE_CHARACTERS).length - failures}/`
        + `${Object.keys(NAMED_TEMPLATE_CHARACTERS).length} placement checks passed`);
    process.exit(failures > 0 ? 1 : 0);
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
