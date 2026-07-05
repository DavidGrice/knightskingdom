import { launch, seedAuth, selectWorld, waitForMapLoad } from './lib/driver.mjs';

/**
 * E2E probe for ADDING-mode placement: opens the bucket, selects the first
 * model, parks an existing model (Richard, template-02) in front of the
 * camera, and clicks ON his horse's body. Asserts the new model spawns
 * BESIDE him on the terrain -- not floating at the clicked surface height
 * (and not on top of an invisible selection box).
 * Run with the dev server up: node testing/add-placement.probe.mjs
 */

const main = async () => {
    const { browser, page, errors } = await launch();
    const failures = [];
    try {
        await seedAuth(page);
        await selectWorld(page, 1);
        await waitForMapLoad(page);
        await new Promise((r) => setTimeout(r, 4000));

        // open the bucket and select the first model
        await page.evaluate(() => {
            const img = [...document.querySelectorAll('img')].find((el) => /bucket/i.test(el.src));
            img?.click();
        });
        await new Promise((r) => setTimeout(r, 800));
        const picked = await page.evaluate(() => {
            const item = [...document.querySelectorAll('div[class*="item"]')]
                .find((el) => el.style.backgroundImage);
            if (!item) return false;
            item.click();
            return true;
        });
        if (!picked) failures.push('no bucket item found to select');
        await new Promise((r) => setTimeout(r, 600));

        // park Richard dead-centre in front of the camera, then aim at the
        // horse body (slightly below box centre -- dense, unmissable
        // geometry, unlike the gappy region around the rider)
        const aim = await page.evaluate(() => {
            const scene = window.__gameScene;
            const camera = window.__gameCamera;
            const target = scene.children.find((c) => /RS01/i.test(c.name || ''));
            if (!target) return { error: 'RS01 not found' };
            const V = target.position.constructor;
            const box = target.userData.transparentBox;
            const size = new V();
            box.geometry.computeBoundingBox();
            box.geometry.boundingBox.getSize(size).multiply(box.getWorldScale(new V()));
            const h = Math.abs(size.y);
            const dir = new V(0, 0, -1).applyQuaternion(camera.quaternion);
            const spot = camera.position.clone().add(dir.clone().multiplyScalar(h * 2.5));
            const boxWorld = box.getWorldPosition(new V());
            target.position.add(spot.clone().sub(boxWorld));
            target.updateMatrixWorld(true);

            const aimWorld = box.getWorldPosition(new V());
            aimWorld.y -= h * 0.22; // horse body
            const ndc = aimWorld.project(camera);
            const rect = document.querySelector('canvas').getBoundingClientRect();
            window.__before = new Set(scene.children.map((c) => c.uuid));
            window.__target = target;
            return {
                x: rect.left + ((ndc.x + 1) / 2) * rect.width,
                y: rect.top + ((1 - ndc.y) / 2) * rect.height,
            };
        });
        if (aim.error) throw new Error(aim.error);
        await page.mouse.click(aim.x, aim.y);
        await new Promise((r) => setTimeout(r, 3500));

        const checks = await page.evaluate(() => {
            const scene = window.__gameScene;
            const added = scene.children.find(
                (c) => c.isModel && !window.__before.has(c.uuid),
            );
            if (!added) return { error: 'no new model spawned' };
            const V = added.position.constructor;
            const measure = (root) => {
                const box = root.userData.transparentBox;
                const pos = box.getWorldPosition(new V());
                const size = new V();
                box.geometry.computeBoundingBox();
                box.geometry.boundingBox.getSize(size).multiply(box.getWorldScale(new V()));
                size.set(Math.abs(size.x), Math.abs(size.y), Math.abs(size.z));
                return { pos, size, feetY: pos.y - size.y / 2 };
            };
            const a = measure(added);
            const t = measure(window.__target);
            return {
                name: added.name,
                horizontalGap: Math.hypot(a.pos.x - t.pos.x, a.pos.z - t.pos.z),
                targetHalfMax: Math.max(t.size.x, t.size.z) / 2,
                besideMax: Math.max(t.size.x, t.size.z) * 2.5,
                addedFeetY: a.feetY,
                targetFeetY: t.feetY,
                clickedSurfaceY: t.pos.y, // roughly where the click landed (horse body height)
            };
        });

        if (checks.error) {
            failures.push(checks.error);
        } else {
            console.log(JSON.stringify(checks, null, 2));
            if (checks.horizontalGap <= checks.targetHalfMax) {
                failures.push(`spawned inside the clicked model's footprint (gap ${checks.horizontalGap.toFixed(2)})`);
            }
            if (checks.horizontalGap > checks.besideMax) {
                failures.push(`spawned far away, not beside the clicked model (gap ${checks.horizontalGap.toFixed(2)} > ${checks.besideMax.toFixed(2)})`);
            }
            // The probe parks Richard floating mid-air, so the correct
            // outcome is feet on the TERRAIN (y~0 near template-02's
            // origin), NOT at his float height or the clicked surface.
            if (Math.abs(checks.addedFeetY) > 2) {
                failures.push(`not grounded on the terrain (feet ${checks.addedFeetY.toFixed(2)})`);
            }
            if (Math.abs(checks.addedFeetY - checks.clickedSurfaceY) < 0.5) {
                failures.push('spawned floating at the clicked surface height (the old bug)');
            }
        }

        const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
        if (realErrors.length) failures.push(`page errors: ${realErrors.join(' | ')}`);
        console.log(failures.length ? `FAIL:\n- ${failures.join('\n- ')}` : 'ADD-PLACEMENT: PASS');
        process.exitCode = failures.length ? 1 : 0;
    } finally {
        await browser.close();
    }
};

main();
