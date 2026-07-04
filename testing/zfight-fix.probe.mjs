import { launch, seedAuth, selectWorld, waitForMapLoad } from './lib/driver.mjs';

/**
 * Probe for the Phase 4 z-fighting fixes:
 *  1. decal fix -- every textured material in the live scene carries the
 *     polygonOffset that lets decorated faces win over their coplanar base;
 *  2. baked-twin fix -- for every spawned map placement, the baked map
 *     mesh group with the same WLD object number is hidden (and nothing
 *     else in the baked map was hidden).
 * Run manually with the dev server up: node testing/zfight-fix.probe.mjs
 */

const main = async () => {
    const { browser, page, errors } = await launch();
    try {
        await seedAuth(page);
        await selectWorld(page, 0);
        await waitForMapLoad(page);
        await new Promise((r) => setTimeout(r, 4000));

        const report = await page.evaluate(() => {
            const scene = window.__gameScene;
            let texturedMats = 0;
            let texturedWithOffset = 0;
            scene.traverse((node) => {
                if (!node.isMesh || !node.material) return;
                const mats = Array.isArray(node.material) ? node.material : [node.material];
                mats.forEach((m) => {
                    if (m.map) {
                        texturedMats += 1;
                        // constant-bias decal offset: units negative, factor
                        // MUST be 0 (slope-scaled factors punch through
                        // occluders at glancing angles)
                        if (m.polygonOffset && m.polygonOffsetUnits < 0
                            && m.polygonOffsetFactor === 0) texturedWithOffset += 1;
                    }
                });
            });

            const mapRoot = scene.getObjectByName('GameMap');
            const hiddenBaked = [];
            const visibleBaked = [];
            mapRoot?.traverse((child) => {
                if (!child.isMesh) return;
                (child.visible ? visibleBaked : hiddenBaked).push(child.name);
            });

            const spawnedNumbers = new Set(
                scene.children
                    .filter((c) => c.userData?.placementNumber != null)
                    .map((c) => String(c.userData.placementNumber).padStart(3, '0')),
            );
            const hiddenMatchingSpawn = hiddenBaked
                .filter((n) => spawnedNumbers.has(n.slice(0, 3))).length;

            return {
                texturedMats,
                texturedWithOffset,
                spawned: spawnedNumbers.size,
                hiddenBaked: hiddenBaked.length,
                hiddenMatchingSpawn,
                visibleBaked: visibleBaked.length,
            };
        });

        console.log(JSON.stringify(report, null, 2));
        const failures = [];
        if (report.texturedMats === 0) failures.push('no textured materials found');
        if (report.texturedWithOffset !== report.texturedMats) {
            failures.push(`only ${report.texturedWithOffset}/${report.texturedMats} textured materials have the decal polygonOffset`);
        }
        if (report.hiddenBaked === 0) failures.push('no baked map twins were hidden');
        if (report.hiddenMatchingSpawn !== report.hiddenBaked) {
            failures.push('hidden baked meshes exist that do not correspond to a spawned placement');
        }
        if (report.visibleBaked === 0) failures.push('entire baked map hidden -- terrain should remain');
        const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
        if (realErrors.length) failures.push(`page errors: ${realErrors.join(' | ')}`);

        console.log(failures.length ? `FAIL:\n- ${failures.join('\n- ')}` : 'Z-FIGHT FIXES: PASS');
        process.exitCode = failures.length ? 1 : 0;
    } finally {
        await browser.close();
    }
};

main();
