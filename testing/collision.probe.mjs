import { launch, seedAuth, selectWorld, waitForMapLoad } from './lib/driver.mjs';

/**
 * Verifies type-aware collision in the main game:
 *  - plate vs plate: blocked (plates can't pass through each other),
 *  - character vs character: blocked,
 *  - character vs plate: NOT blocked (a character can move freely over a
 *    ground plate).
 * Run with the dev server up: node testing/collision.probe.mjs
 */

const BOX_FN = `(r) => {
  const V = window.__gameCamera.position.constructor;
  const bb = { min: new V(1e9,1e9,1e9), max: new V(-1e9,-1e9,-1e9) };
  r.traverse((m) => {
    if (!m.isMesh || m.name === 'transparentBox' || m.name === 'wireframe') return;
    m.geometry.computeBoundingBox();
    const g = m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld);
    bb.min.min(g.min); bb.max.max(g.max);
  });
  return bb;
}`;

const drag = async (page, grab, target, steps = 20) => {
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.move(grab.x + (target.x - grab.x) * i / steps, grab.y + (target.y - grab.y) * i / steps);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 35));
  }
  await page.mouse.up();
  await new Promise((r) => setTimeout(r, 250));
};

const clickMove = (page) => page.evaluate(() => {
  const img = [...document.querySelectorAll('img')].find((el) => /(?<!re)move/i.test(el.src) && el.width > 30);
  img?.click();
});

const main = async () => {
  const { browser, page, errors } = await launch();
  const failures = [];
  const ok = (label, cond) => { console.log(`  ${cond ? 'ok' : 'FAIL'}: ${label}`); if (!cond) failures.push(label); };
  try {
    await seedAuth(page);
    await selectWorld(page, 0);
    await waitForMapLoad(page);
    await new Promise((r) => setTimeout(r, 6000));

    // ---- PLATE vs PLATE ----
    await clickMove(page);
    await new Promise((r) => setTimeout(r, 300));
    let s = await page.evaluate((boxSrc) => {
      const box = eval(boxSrc);
      const scene = window.__gameScene; const cam = window.__gameCamera; const V = cam.position.constructor;
      const p = scene.children.filter((c) => c.userData?.modelId === 'l4109610');
      const a = p[0]; const b = p[1];
      window.__a = a; window.__bBox = box(b);
      const mid = a.position.clone().add(b.position).multiplyScalar(0.5);
      cam.position.set(mid.x, mid.y + 40, mid.z + 1); cam.lookAt(mid.x, 0, mid.z);
      const ctrl = window.__gameControls; ctrl.target.set(mid.x, 0, mid.z); ctrl.update(); cam.updateMatrixWorld(true);
      const ap = a.userData.transparentBox.getWorldPosition(new V()); const bp = b.userData.transparentBox.getWorldPosition(new V());
      const an = ap.clone().project(cam); const bn = bp.clone().project(cam);
      const rect = document.querySelector('canvas').getBoundingClientRect();
      return { ax: rect.left + ((an.x + 1) / 2) * rect.width, ay: rect.top + ((1 - an.y) / 2) * rect.height,
        bx: rect.left + ((bn.x + 1) / 2) * rect.width, by: rect.top + ((1 - bn.y) / 2) * rect.height };
    }, BOX_FN);
    await drag(page, { x: s.ax, y: s.ay }, { x: s.bx, y: s.by });
    const pr = await page.evaluate((boxSrc) => {
      const box = eval(boxSrc); const a = box(window.__a); const b = window.__bBox;
      return { overlapZ: Math.max(0, Math.min(a.max.z, b.max.z) - Math.max(a.min.z, b.min.z)) };
    }, BOX_FN);
    console.log(`  plate-plate interpenetration Z = ${pr.overlapZ.toFixed(1)}`);
    ok('plate blocked by plate (interpenetration < 3)', pr.overlapZ < 3);

    // ---- CHARACTER vs CHARACTER (add beside queen, drag in) ----
    const qpos = await page.evaluate(() => {
      const scene = window.__gameScene; const cam = window.__gameCamera; const V = cam.position.constructor;
      const q = scene.children.find((r) => /QL01/i.test(r.name || '')); window.__q = q;
      const p = q.userData.transparentBox.getWorldPosition(new V());
      cam.position.set(p.x + 8, p.y + 7, p.z + 8); cam.lookAt(p);
      const ctrl = window.__gameControls; ctrl.target.copy(p); ctrl.update(); cam.updateMatrixWorld(true);
      const ndc = p.clone().project(cam); const rect = document.querySelector('canvas').getBoundingClientRect();
      return { qx: rect.left + ((ndc.x + 1) / 2) * rect.width, qy: rect.top + ((1 - ndc.y) / 2) * rect.height };
    });
    await page.evaluate(() => { [...document.querySelectorAll('img')].find((el) => /bucket/i.test(el.src))?.click(); });
    await new Promise((r) => setTimeout(r, 700));
    await page.evaluate(() => { [...document.querySelectorAll('div[class*="item"]')].find((el) => el.style.backgroundImage)?.click(); });
    await new Promise((r) => setTimeout(r, 400));
    await page.mouse.click(qpos.qx, qpos.qy);
    await new Promise((r) => setTimeout(r, 1800));
    const added = await page.evaluate(() => {
      const scene = window.__gameScene;
      const m = scene.children.filter((c) => c.isModel && c.userData?.modelId && !c.userData?.isGroundPlate && !c.userData?.placementNumber && !/QL01/i.test(c.name || ''));
      if (!m.length) return false;
      window.__added = m[m.length - 1];
      return true;
    });
    ok('a model spawned beside the queen', added);
    if (added) {
      await clickMove(page);
      await new Promise((r) => setTimeout(r, 300));
      s = await page.evaluate((boxSrc) => {
        const box = eval(boxSrc); const cam = window.__gameCamera; const V = cam.position.constructor; cam.updateMatrixWorld(true);
        window.__qBox = box(window.__q);
        const ap = window.__added.userData.transparentBox.getWorldPosition(new V());
        const qp = window.__q.userData.transparentBox.getWorldPosition(new V());
        const an = ap.clone().project(cam); const qn = qp.clone().project(cam);
        const rect = document.querySelector('canvas').getBoundingClientRect();
        return { ax: rect.left + ((an.x + 1) / 2) * rect.width, ay: rect.top + ((1 - an.y) / 2) * rect.height,
          qx: rect.left + ((qn.x + 1) / 2) * rect.width, qy: rect.top + ((1 - qn.y) / 2) * rect.height };
      }, BOX_FN);
      await drag(page, { x: s.ax, y: s.ay }, { x: s.qx, y: s.qy });
      const cr = await page.evaluate((boxSrc) => {
        const box = eval(boxSrc); const a = box(window.__added); const q = window.__qBox;
        return { overlaps: a.min.x < q.max.x && a.max.x > q.min.x && a.min.z < q.max.z && a.max.z > q.min.z };
      }, BOX_FN);
      ok('character blocked by character (no overlap)', !cr.overlaps);
    }

    const realErrors = errors.filter((e) => !e.includes('favicon.ico'));
    if (realErrors.length) failures.push(`page errors: ${realErrors.join(' | ')}`);
    console.log(failures.length ? `\nFAIL (${failures.length})` : '\nCOLLISION: PASS');
    process.exitCode = failures.length ? 1 : 0;
  } finally {
    await browser.close();
  }
};

main();
