import puppeteer from 'puppeteer';
import { BASE_URL, selectWorld, waitForMapLoad } from './lib/driver.mjs';

/**
 * End-to-end probe for the settings-profile wiring (Phase 3) and the
 * authentic paint palette. Runs the same world twice with opposite
 * profiles and asserts the engine actually honoured each option:
 *   hardware/high profile -> canvas context has antialias, bulk local-part
 *     placements spawn, help bubble hidden (dialogue off);
 *   software/low profile  -> no antialias, bulk placements skipped, help
 *     bubble visible (dialogue on).
 * Then, in the hardware run, paints a model via the real palette UI and
 * asserts the applied colour is the authentic palette red (B80000).
 * Run manually with the dev server up: node testing/settings-palette.probe.mjs
 */

const launchWithProfile = async (options) => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    const errors = [];
    page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
    await page.goto(`${BASE_URL}/authentication`, { waitUntil: 'networkidle0' });
    await page.evaluate((opts) => {
        const profile = { id: 1, name: 'David', level: 'baronet', options: opts };
        sessionStorage.setItem('knights-kingdom-auth', JSON.stringify({ selectedProfile: profile }));
        // userData (localStorage) is the source of truth for profile options --
        // WorldSessionProvider resolves currentProfile from it by id, so the
        // options must live here, not just on the session-auth copy.
        localStorage.setItem('knights-kingdom-user-data', JSON.stringify([profile]));
    }, options);
    return { browser, page, errors };
};

const inspect = (page) => page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const placed = window.__placedObjects || [];
    return {
        antialias: gl.getContextAttributes().antialias,
        bulkPlacements: placed.filter((p) => p.source === 'local-part').length,
        notablePlacements: placed.filter((p) => p.source === 'catalog' || p.tier === 1).length,
        helpVisible: [...document.querySelectorAll('img')].some((el) => /help/i.test(el.src)),
    };
});

const failures = [];
const expect = (label, cond) => {
    console.log(`  ${cond ? 'ok' : 'FAIL'}: ${label}`);
    if (!cond) failures.push(label);
};

const run = async () => {
    // ---- run 1: hardware renderer, high quality, dialogue off
    let { browser, page, errors } = await launchWithProfile(
        { brickQuality: 'high', renderer: 'hardware', dialogue: 'off', music: 'off' },
    );
    try {
        await selectWorld(page, 0);
        await waitForMapLoad(page);
        await new Promise((r) => setTimeout(r, 4000));
        const hw = await inspect(page);
        console.log('hardware/high profile:', JSON.stringify(hw));
        expect('hardware profile: antialias on', hw.antialias === true);
        expect('high quality: bulk placements spawn', hw.bulkPlacements > 10);
        expect('dialogue off: help bubble hidden', hw.helpVisible === false);

        // ---- paint flow: repaint tool -> red splat -> click the queen
        await page.evaluate(() => {
            const img = [...document.querySelectorAll('img')].find((el) => /repaint/i.test(el.src));
            img?.click();
        });
        await new Promise((r) => setTimeout(r, 400));
        const pickedSplat = await page.evaluate(() => {
            const img = [...document.querySelectorAll('img')].find((el) => /pal_red/i.test(el.src));
            if (!img) return false;
            img.click();
            return true;
        });
        expect('palette open + red splat found', pickedSplat);
        await new Promise((r) => setTimeout(r, 300));

        const paintTarget = await page.evaluate(() => {
            const scene = window.__gameScene;
            const camera = window.__gameCamera;
            const canvas = document.querySelector('canvas');
            const rect = canvas.getBoundingClientRect();
            const root = scene.children.find((c) => c.isModel && c.isPaintable && c.userData?.transparentBox);
            if (!root) return null;
            const V = camera.position.constructor;
            const p = root.userData.transparentBox.getWorldPosition(new V());
            // Aim the camera at the model so the click reliably hits it (the
            // scene layout shifts between builds -- e.g. the plate Y-lift).
            camera.position.set(p.x + 4, p.y + 3, p.z + 4);
            camera.lookAt(p);
            const ctrl = window.__gameControls;
            if (ctrl) { ctrl.target.copy(p); ctrl.update(); }
            camera.updateMatrixWorld(true);
            const ndc = p.clone().project(camera);
            window.__paintProbeRoot = root;
            return {
                x: rect.left + ((ndc.x + 1) / 2) * rect.width,
                y: rect.top + ((1 - ndc.y) / 2) * rect.height,
            };
        });
        expect('paintable model on screen', Boolean(paintTarget));
        if (paintTarget) {
            await page.mouse.click(paintTarget.x, paintTarget.y);
            await new Promise((r) => setTimeout(r, 300));
            const painted = await page.evaluate(() => {
                const root = window.__paintProbeRoot;
                let firstMeshColor = null;
                root.traverse((c) => {
                    if (!firstMeshColor && c.isMesh && c.isPaintable
                        && c.name !== 'transparentBox' && c.material?.color) {
                        firstMeshColor = c.material.color.getHexString().toUpperCase();
                    }
                });
                return { saved: root.userData.color, mesh: firstMeshColor };
            });
            console.log('paint result:', JSON.stringify(painted));
            expect('painted colour is authentic red B80000',
                painted.saved === 'B80000' && painted.mesh === 'B80000');
        }
        if (errors.length) failures.push(`hw run page errors: ${errors.join(' | ')}`);
    } finally {
        await browser.close();
    }

    // ---- run 2: software renderer, low quality, dialogue on
    ({ browser, page, errors } = await launchWithProfile(
        { brickQuality: 'low', renderer: 'software', dialogue: 'on', music: 'on' },
    ));
    try {
        await selectWorld(page, 0);
        await waitForMapLoad(page);
        await new Promise((r) => setTimeout(r, 4000));
        const sw = await inspect(page);
        console.log('software/low profile:', JSON.stringify(sw));
        expect('software profile: antialias off', sw.antialias === false);
        expect('low quality: bulk placements skipped', sw.bulkPlacements === 0);
        expect('notable placements still spawn on low', sw.notablePlacements > 0);
        expect('dialogue on: help bubble visible', sw.helpVisible === true);
        if (errors.length) failures.push(`sw run page errors: ${errors.join(' | ')}`);
    } finally {
        await browser.close();
    }

    console.log(failures.length ? `\nFAIL (${failures.length})` : '\nALL SETTINGS + PALETTE CHECKS PASS');
    process.exitCode = failures.length ? 1 : 0;
};

run();
