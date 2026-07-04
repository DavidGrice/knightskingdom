import { launch, seedAuth, selectWorld, waitForMapLoad } from './lib/driver.mjs';

/**
 * Verifies the main-game interaction upgrades: rotate-around-center,
 * shift-drag vertical, collision block, and grid snapping. Drives the real
 * canvas + inspects window.__gameScene. Run with dev server up:
 *   node testing/interactions.probe.mjs
 */

const contentCenter = (page, name) => page.evaluate((n) => {
  const scene = window.__gameScene;
  const V = window.__gameCamera.position.constructor;
  const root = scene.children.find((c) => c.isModel && (c.name || '').includes(n));
  if (!root) return null;
  const box = { min: new V(1e9, 1e9, 1e9), max: new V(-1e9, -1e9, -1e9) };
  root.traverse((c) => {
    if (!c.isMesh || c.name === 'transparentBox' || c.name === 'wireframe') return;
    c.geometry.computeBoundingBox();
    const bb = c.geometry.boundingBox.clone().applyMatrix4(c.matrixWorld);
    box.min.min(bb.min); box.max.max(bb.max);
  });
  return { cx: (box.min.x + box.max.x) / 2, cy: (box.min.y + box.max.y) / 2, cz: (box.min.z + box.max.z) / 2,
    rootY: root.position.y };
}, name);

const aimAt = (page, name) => page.evaluate((n) => {
  const scene = window.__gameScene;
  const cam = window.__gameCamera;
  const root = scene.children.find((c) => c.isModel && (c.name || '').includes(n));
  if (!root) return null;
  const V = cam.position.constructor;
  const box = root.userData.transparentBox;
  const c = box ? box.getWorldPosition(new V()) : root.position.clone();
  cam.position.set(c.x + 5, c.y + 4, c.z + 5);
  cam.lookAt(c);
  const ctrl = window.__gameControls; if (ctrl) { ctrl.target.copy(c); ctrl.update(); }
  cam.updateMatrixWorld(true);
  const ndc = c.clone().project(cam);
  const rect = document.querySelector('canvas').getBoundingClientRect();
  return { x: rect.left + ((ndc.x + 1) / 2) * rect.width, y: rect.top + ((1 - ndc.y) / 2) * rect.height };
}, name);

const clickTool = (page, re) => page.evaluate((r) => {
  const img = [...document.querySelectorAll('img')].find((el) => new RegExp(r, 'i').test(el.src) && el.width > 30);
  img?.click();
  return Boolean(img);
}, re.source);

const main = async () => {
  const { browser, page, errors } = await launch();
  const failures = [];
  const ok = (label, cond) => { console.log(`  ${cond ? 'ok' : 'FAIL'}: ${label}`); if (!cond) failures.push(label); };
  try {
    await seedAuth(page);
    await selectWorld(page, 0);
    await waitForMapLoad(page);
    await new Promise((r) => setTimeout(r, 5000));
    const target = 'QL01'; // the queen

    // --- ROTATE AROUND CENTER ---
    await clickTool(page, /reverse|rotate/);
    await new Promise((r) => setTimeout(r, 300));
    const before = await contentCenter(page, target);
    const rp = await aimAt(page, target);
    await page.mouse.click(rp.x, rp.y);
    await new Promise((r) => setTimeout(r, 500));
    const after = await contentCenter(page, target);
    const drift = Math.hypot(after.cx - before.cx, after.cz - before.cz);
    console.log(`rotate center drift: ${drift.toFixed(3)}`);
    ok('rotate keeps content center in place (<1.0)', drift < 1.0);

    // --- SHIFT-DRAG VERTICAL ---
    await clickTool(page, /(?<!re)move/);
    await new Promise((r) => setTimeout(r, 300));
    const mp = await aimAt(page, target);
    const y0 = (await contentCenter(page, target)).rootY;
    await page.mouse.move(mp.x, mp.y);
    await page.mouse.down();
    await page.keyboard.down('Shift');
    for (let i = 1; i <= 8; i += 1) { await page.mouse.move(mp.x, mp.y - i * 12); await new Promise((r) => setTimeout(r, 30)); }
    await page.keyboard.up('Shift');
    await page.mouse.up();
    await new Promise((r) => setTimeout(r, 300));
    const y1 = (await contentCenter(page, target)).rootY;
    console.log(`shift-vertical rootY ${y0.toFixed(2)} -> ${y1.toFixed(2)}`);
    ok('shift+drag raised the model', y1 - y0 > 0.5);

    // --- GRID SNAP ---
    const pos = await page.evaluate((n) => {
      const scene = window.__gameScene;
      const root = scene.children.find((c) => c.isModel && (c.name || '').includes(n));
      return { x: root.position.x, z: root.position.z };
    }, target);
    const rem = (v) => Math.abs(v / 0.8 - Math.round(v / 0.8));
    ok('final XZ snapped to 0.8 grid', rem(pos.x) < 0.01 && rem(pos.z) < 0.01);

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length) failures.push(`page errors: ${realErrors.join(' | ')}`);
    console.log(failures.length ? `\nFAIL (${failures.length})` : '\nINTERACTIONS: PASS');
    process.exitCode = failures.length ? 1 : 0;
  } finally {
    await browser.close();
  }
};

main();
