import { launch, seedAuth, selectWorld, waitForMapLoad } from './lib/driver.mjs';

/**
 * One-off probe for the Phase 1/2 interaction fixes: inspects the live
 * scene graph (window.__gameScene) after world load and asserts the
 * invariants the move/rotate/paint/delete rewrite depends on. Not part of
 * the standing suites -- run manually: node testing/phase1-verify.probe.mjs
 */

const main = async () => {
    const { browser, page, errors } = await launch();
    try {
        await seedAuth(page);
        await selectWorld(page, 0);
        await waitForMapLoad(page);
        // placements + preloads spawn async after map load
        await new Promise((r) => setTimeout(r, 4000));

        const report = await page.evaluate(() => {
            const scene = window.__gameScene;
            const roots = scene.children.filter((c) => c.isModel);
            const movable = roots.filter((r) => r.isMovable);
            const out = {
                modelRoots: roots.length,
                movableRoots: movable.length,
                movableWithBox: 0,
                boxesWithWireframe: 0,
                boxesHidden: 0,
                rotatable: roots.filter((r) => r.isRotatable).length,
                sceneIsMovable: Boolean(scene.isMovable),
                materialSharing: null,
            };
            movable.forEach((r) => {
                const box = r.userData?.transparentBox;
                if (!box) return;
                out.movableWithBox += 1;
                if (box.getObjectByName('wireframe')) out.boxesWithWireframe += 1;
                if (!box.visible) out.boxesHidden += 1;
            });

            // per-instance materials: find two roots sharing a modelId
            const byModel = new Map();
            roots.forEach((r) => {
                const id = r.userData?.modelId;
                if (id) (byModel.get(id) || byModel.set(id, []).get(id)).push(r);
            });
            for (const [id, group] of byModel) {
                if (group.length < 2) continue;
                const mats = group.map((r) => {
                    let uuid = null;
                    r.traverse((c) => {
                        if (!uuid && c.isMesh && c.material && c.name !== 'transparentBox') {
                            uuid = Array.isArray(c.material) ? c.material[0].uuid : c.material.uuid;
                        }
                    });
                    return uuid;
                });
                out.materialSharing = {
                    modelId: id,
                    instances: group.length,
                    distinctFirstMaterials: new Set(mats.filter(Boolean)).size,
                };
                break;
            }
            return out;
        });

        console.log(JSON.stringify(report, null, 2));
        const failures = [];
        if (report.modelRoots === 0) failures.push('no model roots found');
        if (report.movableRoots === 0) failures.push('no movable roots');
        if (report.movableWithBox !== report.movableRoots) {
            failures.push(`only ${report.movableWithBox}/${report.movableRoots} movable roots have a selection box`);
        }
        if (report.boxesWithWireframe !== report.movableWithBox) failures.push('box missing wireframe');
        if (report.boxesHidden !== report.movableWithBox) failures.push('box not hidden at rest');
        if (report.sceneIsMovable) failures.push('scene itself is flagged movable');
        if (report.materialSharing
            && report.materialSharing.distinctFirstMaterials !== report.materialSharing.instances) {
            failures.push(`materials shared across instances of ${report.materialSharing.modelId}`);
        }

        const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
        if (realErrors.length) failures.push(`page errors: ${realErrors.join(' | ')}`);

        console.log(failures.length ? `FAIL:\n- ${failures.join('\n- ')}` : 'ALL PHASE 1/2 INVARIANTS PASS');
        process.exitCode = failures.length ? 1 : 0;
    } finally {
        await browser.close();
    }
};

main();
