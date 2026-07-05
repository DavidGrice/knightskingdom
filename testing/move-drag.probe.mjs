import { launch, seedAuth, selectWorld, waitForMapLoad } from './lib/driver.mjs';

/**
 * End-to-end probe for click-and-hold model moving (Phase 1): clicks the
 * MOVE tool in the top toolbar, mousedowns on a movable model, drags, and
 * asserts (a) the selection bounding box became visible during the drag,
 * (b) the model actually translated, (c) the box hides again on release.
 * Run manually with the dev server up: node testing/move-drag.probe.mjs
 */

const main = async () => {
    const { browser, page, errors } = await launch();
    try {
        await seedAuth(page);
        await selectWorld(page, 0);
        await waitForMapLoad(page);
        await new Promise((r) => setTimeout(r, 4000));

        // 1) activate the MOVE tool (toolbar img whose src names the move icon)
        const clickedTool = await page.evaluate(() => {
            const img = [...document.querySelectorAll('img')].find(
                (el) => /move/i.test(el.src) && el.width > 30,
            );
            if (!img) return null;
            img.click();
            return img.src;
        });
        if (!clickedTool) throw new Error('move toolbar icon not found');

        await new Promise((r) => setTimeout(r, 500));

        // 2) find a movable model and project it to pixels. Placements sit
        //    at the castle (not at camera spawn), so aim the camera at the
        //    first movable model before searching.
        await page.evaluate(() => {
            const scene = window.__gameScene;
            const camera = window.__gameCamera;
            const first = scene.children.find((c) => c.isModel && c.isMovable && c.userData?.transparentBox);
            if (!first) return;
            const V = camera.position.constructor;
            const c = first.position.clone();
            camera.position.set(c.x + 6, c.y + 4, c.z + 6);
            camera.lookAt(c);
            const ctrl = window.__gameControls;
            if (ctrl) { ctrl.target.copy(c); ctrl.update(); }
            camera.updateMatrixWorld(true);
        });
        await new Promise((r) => setTimeout(r, 200));
        const target = await page.evaluate(() => {
            const scene = window.__gameScene;
            const camera = window.__gameCamera;
            const canvas = document.querySelector('canvas');
            const rect = canvas.getBoundingClientRect();
            const candidates = scene.children.filter((c) => c.isModel && c.isMovable);
            for (const root of candidates) {
                root.updateMatrixWorld(true);
                const box = root.userData?.transparentBox;
                if (!box) continue;
                const p = box.getWorldPosition(new (box.position.constructor)());
                const ndc = p.clone().project(camera);
                if (ndc.z > 1 || Math.abs(ndc.x) > 0.85 || Math.abs(ndc.y) > 0.85) continue;
                window.__moveProbeRoot = root;
                return {
                    name: root.name,
                    x: rect.left + ((ndc.x + 1) / 2) * rect.width,
                    y: rect.top + ((1 - ndc.y) / 2) * rect.height,
                    startPos: { x: root.position.x, z: root.position.z },
                };
            }
            return null;
        });
        if (!target) throw new Error('no on-screen movable model found');

        // 3) press, sample mid-drag, move, release
        await page.mouse.move(target.x, target.y);
        await page.mouse.down();
        await new Promise((r) => setTimeout(r, 150));

        const midDrag = await page.evaluate(() => {
            const root = window.__moveProbeRoot;
            const box = root.userData?.transparentBox;
            return {
                boxVisible: Boolean(box?.visible),
                wireVisible: Boolean(box?.getObjectByName('wireframe')?.visible),
            };
        });

        for (let i = 1; i <= 10; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            await page.mouse.move(target.x + i * 12, target.y + i * 4);
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, 40));
        }
        await page.mouse.up();
        await new Promise((r) => setTimeout(r, 300));

        const after = await page.evaluate(() => {
            const root = window.__moveProbeRoot;
            const box = root.userData?.transparentBox;
            return {
                pos: { x: root.position.x, z: root.position.z },
                boxVisible: Boolean(box?.visible),
            };
        });

        const movedBy = Math.hypot(
            after.pos.x - target.startPos.x,
            after.pos.z - target.startPos.z,
        );

        console.log(JSON.stringify({ target: target.name, midDrag, after, movedBy }, null, 2));

        const failures = [];
        if (!midDrag.boxVisible) failures.push('bounding box not visible during drag');
        if (!midDrag.wireVisible) failures.push('wireframe not visible during drag');
        if (movedBy < 0.5) failures.push(`model barely moved (${movedBy.toFixed(3)} world units)`);
        if (after.boxVisible) failures.push('bounding box still visible after release');
        const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
        if (realErrors.length) failures.push(`page errors: ${realErrors.join(' | ')}`);

        console.log(failures.length ? `FAIL:\n- ${failures.join('\n- ')}` : 'MOVE + BOUNDING BOX: PASS');
        process.exitCode = failures.length ? 1 : 0;
    } finally {
        await browser.close();
    }
};

main();
