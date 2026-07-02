#!/usr/bin/env node
/**
 * pilot_track_a.mjs -- Phase 1A pilot verification for the MainGame
 * warehouse bucket (Track A). Converts 5 representative ids to GLB (scratch
 * output only, does not touch src/) and screenshots each from 2 angles so
 * the output can be visually reviewed before batch-converting all 108.
 *
 * Usage: node resources/model_files/pilot_track_a.mjs
 */
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { convertObjToGlb } from './obj2gltfHelper.mjs';
import { startServer } from './static_server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, 'extracted', 'models');
const OUT_DIR = path.join(__dirname, 'pilot_out');

const PILOTS = [
  { id: 'mc001', category: 'buildings' },
  { id: 'oc6032', category: 'vehicles' },
  { id: 'l7339200', category: 'minifigures_animals' },
  { id: 'l606400', category: 'scenery' },
  { id: 'l248901', category: 'explosives' },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('== Converting pilots to scratch GLB ==');
  const results = [];
  for (const { id, category } of PILOTS) {
    const objPath = path.join(MODELS_DIR, `${id}.obj`);
    if (!fs.existsSync(objPath)) {
      console.log(`!! MISSING SOURCE: ${objPath}`);
      results.push({ id, category, error: 'missing .obj source' });
      continue;
    }
    const outPath = path.join(OUT_DIR, `${id}.glb`);
    const { warnings, size } = await convertObjToGlb(objPath, outPath);
    console.log(`  ${id} (${category}): ${(size / 1024).toFixed(1)} KB, ${warnings.length} warning(s)`);
    results.push({ id, category, size, warnings });
  }

  console.log('\n== Starting local static server ==');
  const { server, port, root } = await startServer();
  console.log(`  serving ${root} on http://127.0.0.1:${port}`);

  console.log('\n== Rendering screenshots ==');
  const browser = await puppeteer.launch();
  for (const r of results) {
    if (r.error) continue;
    const page = await browser.newPage();
    await page.setViewport({ width: 512, height: 512 });
    const relGlb = `/resources/model_files/pilot_out/${r.id}.glb`;

    for (const [viewName, angle] of [['view1', 0.6], ['view2', 2.4]]) {
      const url = `http://127.0.0.1:${port}/resources/model_files/pilot_render.html?model=${encodeURIComponent(relGlb)}&angle=${angle}`;
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForFunction(
        () => window.__pilotStatus === 'done' || window.__pilotStatus === 'error',
        { timeout: 15000 },
      );
      const status = await page.evaluate(() => window.__pilotStatus);
      if (status === 'error') {
        const err = await page.evaluate(() => window.__pilotError);
        console.log(`  !! ${r.id} ${viewName}: RENDER ERROR: ${err}`);
        r.renderError = err;
        continue;
      }
      const bbox = await page.evaluate(() => window.__pilotBBox);
      r.bbox = bbox;
      const shotPath = path.join(OUT_DIR, `${r.id}_${viewName}.png`);
      await page.screenshot({ path: shotPath });
      console.log(`  ${r.id} ${viewName}: OK, bbox size [${bbox.size.map((n) => n.toFixed(2)).join(', ')}] -> ${shotPath}`);
    }
    await page.close();
  }

  await browser.close();
  server.close();

  console.log('\n== Summary ==');
  for (const r of results) {
    if (r.error) {
      console.log(`  ${r.id}: FAILED (${r.error})`);
    } else if (r.renderError) {
      console.log(`  ${r.id}: RENDER FAILED (${r.renderError})`);
    } else if (r.warnings && r.warnings.length) {
      console.log(`  ${r.id}: converted with ${r.warnings.length} warning(s) -- review`);
    } else {
      console.log(`  ${r.id}: OK`);
    }
  }
  console.log(`\nScreenshots written to ${OUT_DIR} -- read them to verify before proceeding.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
