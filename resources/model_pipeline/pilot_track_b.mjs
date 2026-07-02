#!/usr/bin/env node
/**
 * pilot_track_b.mjs -- Phase 1B pilot verification for the WorkShop brick
 * builder (Track B). Converts 6 representative brick ids to GLB (scratch
 * output only) and checks their bounding box against the catalog's expected
 * stud-grid footprint (studs.w/d * STUD, recipeHeight) -- this is the
 * specific failure mode the 2026-06-30 "offsets unreliable" verdict
 * described, so it's checked programmatically, not just by eye.
 *
 * Usage: node resources/model_files/pilot_track_b.mjs
 */
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { convertObjToGlb } from './obj2gltfHelper.mjs';
import { startServer } from './static_server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, 'extracted', 'models');
const OUT_DIR = path.join(__dirname, 'pilot_out_bricks');

const STUD = 0.8;
const PLATE_HEIGHT = STUD / 3;
const BRICK_HEIGHT = STUD;

function recipeHeight(shape, heightPlates) {
  const plates = heightPlates ?? 3;
  if (shape === 'BOX' && plates === 3) {
    return BRICK_HEIGHT;
  }
  return PLATE_HEIGHT * plates;
}

const PILOTS = [
  { objId: '00_l300500', brickId: 'l300500', shape: 'BOX', studs: { w: 1, d: 1 }, heightPlates: 3 },
  { objId: '00_l302400', brickId: 'l302400', shape: 'PLATE', studs: { w: 1, d: 1 }, heightPlates: 1 },
  { objId: '00_l304000', brickId: 'l304000', shape: 'SLOPE', studs: { w: 2, d: 1 }, heightPlates: 2 },
  { objId: '00_l306200', brickId: 'l306200', shape: 'CYLINDER', studs: { w: 1, d: 1 }, heightPlates: 3 },
  { objId: '00_l449000', brickId: 'l449000', shape: 'ARCH', studs: { w: 2, d: 1 }, heightPlates: 3 },
  { objId: '48_l420100', brickId: 'l420100', shape: 'COMPOSITE', studs: { w: 2, d: 2 }, heightPlates: 3 },
];

const TOLERANCE = 0.15; // ±15%

function withinTolerance(actual, expected) {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / expected <= TOLERANCE;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('== Converting pilot bricks to scratch GLB ==');
  const results = [];
  for (const p of PILOTS) {
    const objPath = path.join(MODELS_DIR, `${p.objId}.obj`);
    if (!fs.existsSync(objPath)) {
      console.log(`!! MISSING SOURCE: ${objPath}`);
      results.push({ ...p, error: 'missing .obj source' });
      continue;
    }
    const outPath = path.join(OUT_DIR, `${p.brickId}.glb`);
    const { warnings, size } = await convertObjToGlb(objPath, outPath);
    console.log(`  ${p.brickId} (${p.shape}): ${(size / 1024).toFixed(1)} KB, ${warnings.length} warning(s)`);
    results.push({ ...p, size, warnings });
  }

  console.log('\n== Starting local static server ==');
  const { server, port, root } = await startServer();
  console.log(`  serving ${root} on http://127.0.0.1:${port}`);

  console.log('\n== Rendering + measuring bounding boxes ==');
  const browser = await puppeteer.launch();
  for (const r of results) {
    if (r.error) continue;
    const page = await browser.newPage();
    await page.setViewport({ width: 512, height: 512 });
    const relGlb = `/resources/model_files/pilot_out_bricks/${r.brickId}.glb`;
    const url = `http://127.0.0.1:${port}/resources/model_files/pilot_render.html?model=${encodeURIComponent(relGlb)}&angle=0.6`;
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForFunction(
      () => window.__pilotStatus === 'done' || window.__pilotStatus === 'error',
      { timeout: 15000 },
    );
    const status = await page.evaluate(() => window.__pilotStatus);
    if (status === 'error') {
      r.renderError = await page.evaluate(() => window.__pilotError);
      await page.close();
      continue;
    }
    const bbox = await page.evaluate(() => window.__pilotBBox);
    r.bbox = bbox;
    await page.screenshot({ path: path.join(OUT_DIR, `${r.brickId}_view1.png`) });
    await page.close();
  }
  await browser.close();
  server.close();

  console.log('\n== Bounding box vs. expected stud footprint ==');
  for (const r of results) {
    if (r.error || r.renderError || !r.bbox) {
      console.log(`  ${r.brickId}: SKIPPED (${r.error || r.renderError})`);
      continue;
    }
    const [sx, sy, sz] = r.bbox.size;
    const expW = r.studs.w * STUD;
    const expD = r.studs.d * STUD;
    const expH = recipeHeight(r.shape, r.heightPlates);
    // footprint axes are ambiguous (model may be authored along X or Z) --
    // check both orderings, take whichever matches better
    const matchesDirect = withinTolerance(sx, expW) && withinTolerance(sz, expD);
    const matchesSwapped = withinTolerance(sx, expD) && withinTolerance(sz, expW);
    const heightOk = withinTolerance(sy, expH);
    const footprintOk = matchesDirect || matchesSwapped;
    const impliedScale = ((expW / sx) + (expD / sz) + (expH / sy)) / 3;
    console.log(
      `  ${r.brickId.padEnd(10)} actual [${sx.toFixed(3)}, ${sy.toFixed(3)}, ${sz.toFixed(3)}]` +
      `  expected [${expW.toFixed(3)}, ${expH.toFixed(3)}, ${expD.toFixed(3)}]` +
      `  footprint=${footprintOk ? 'OK' : 'MISMATCH'} height=${heightOk ? 'OK' : 'MISMATCH'}` +
      `  impliedUniformScale~${impliedScale.toFixed(2)}x`,
    );
  }
  console.log(`\nScreenshots + data written to ${OUT_DIR}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
