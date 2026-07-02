#!/usr/bin/env node
/**
 * convert_bricks.mjs -- Phase 2B batch conversion (Track B). Converts every
 * WorkShop brick .lca's extracted .obj/.mtl to a self-contained, correctly
 * scaled .glb written to public/workshop/bricks/<brickId>.glb -- the
 * existing hand-authored-GLB drop zone BrickFactory.js already knows how to
 * load (see loadGlbBrick / shape:'GLB'). Does not touch the WorkShop's own
 * src/ bucket .lca/.png files (kept as "RE reference + UI thumbnail" per
 * grok/WORKSHOP_3D.md).
 *
 * For every converted brick, measures its footprint/height against the
 * catalog's declared studs/heightPlates (same check as the Phase 1B pilot)
 * and writes resources/model_pipeline/brick_conversion_report.json so the
 * Phase 4B catalog generator can enable `shape: 'GLB'` only for bricks whose
 * measured geometry actually matches their declared stud footprint --
 * mismatches (usually a wrong catalog guess, not a bad conversion, per the
 * pilot findings) keep their current parametric shape.
 *
 * Usage: node resources/model_pipeline/convert_bricks.mjs
 */
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { convertObjToGlb, isUpToDate } from './obj2gltfHelper.mjs';
import { startServer } from './static_server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const MODELS_DIR = path.join(ROOT, 'resources', 'model_files', 'extracted', 'models');
const BUCKET_ROOT = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack',
);
const GLB_OUT_ROOT = path.join(ROOT, 'public', 'workshop', 'bricks');
const REPORT_PATH = path.join(__dirname, 'brick_conversion_report.json');
const CATALOG_PATH = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/WorkshopEngine/brickCatalog.generated.js',
);

const STUD = 0.8;
const PLATE_HEIGHT = STUD / 3;
const BRICK_HEIGHT = STUD;
const TOLERANCE = 0.15;

function recipeHeight(shape, heightPlates) {
  const plates = heightPlates ?? 3;
  if (shape === 'BOX' && plates === 3) return BRICK_HEIGHT;
  return PLATE_HEIGHT * plates;
}

function withinTolerance(actual, expected) {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / expected <= TOLERANCE;
}

function extractBrickId(objId) {
  const lMatch = objId.match(/l(\d+)/i);
  if (lMatch) return `l${lMatch[1]}`;
  return objId;
}

function walkLcas(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkLcas(full, base));
    } else if (entry.name.toLowerCase().endsWith('.lca')) {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

function loadCatalog() {
  const src = fs.readFileSync(CATALOG_PATH, 'utf8');
  const jsonStart = src.indexOf('{');
  const jsonEnd = src.lastIndexOf('}');
  return JSON.parse(src.slice(jsonStart, jsonEnd + 1));
}

async function main() {
  const catalog = loadCatalog();
  const rels = walkLcas(BUCKET_ROOT);
  fs.mkdirSync(GLB_OUT_ROOT, { recursive: true });

  console.log(`== Converting ${rels.length} bricks ==`);
  const results = [];
  for (const rel of rels) {
    const objId = path.basename(rel, '.lca'); // e.g. "00_l300500"
    const brickId = extractBrickId(objId); // e.g. "l300500"
    const objPath = path.join(MODELS_DIR, `${objId}.obj`);
    const mtlPath = path.join(MODELS_DIR, `${objId}.mtl`);
    const glbPath = path.join(GLB_OUT_ROOT, `${brickId}.glb`);

    if (!fs.existsSync(objPath)) {
      console.log(`!! MISSING SOURCE .obj for ${objId} (brick ${brickId})`);
      results.push({ brickId, objId, error: 'missing .obj source' });
      continue;
    }

    if (isUpToDate(glbPath, [objPath, mtlPath])) {
      results.push({ brickId, objId, skipped: true });
      continue;
    }

    try {
      const { warnings, size } = await convertObjToGlb(objPath, glbPath);
      results.push({ brickId, objId, size, warnings });
    } catch (err) {
      console.log(`!! FAILED converting ${objId}: ${err.message}`);
      results.push({ brickId, objId, error: err.message });
    }
  }

  const converted = results.filter((r) => !r.error && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const missing = results.filter((r) => r.error).length;
  console.log(`  converted: ${converted}, skipped: ${skipped}, failed: ${missing}`);

  console.log('\n== Measuring bounding boxes vs. catalog stud footprint ==');
  const { server, port, root } = await startServer();
  console.log(`  serving ${root} on http://127.0.0.1:${port}`);
  const browser = await puppeteer.launch();

  for (const r of results) {
    if (r.error) continue;
    const recipe = catalog[r.brickId];
    if (!recipe) {
      r.validation = 'no-catalog-entry';
      continue;
    }
    const page = await browser.newPage();
    await page.setViewport({ width: 256, height: 256 });
    const relGlb = `/public/workshop/bricks/${r.brickId}.glb`;
    const url = `http://127.0.0.1:${port}/resources/model_pipeline/pilot_render.html?model=${encodeURIComponent(relGlb)}&angle=0.6`;
    try {
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForFunction(
        () => window.__pilotStatus === 'done' || window.__pilotStatus === 'error',
        { timeout: 15000 },
      );
      const status = await page.evaluate(() => window.__pilotStatus);
      if (status === 'error') {
        r.validation = 'render-error';
        r.renderError = await page.evaluate(() => window.__pilotError);
        await page.close();
        continue;
      }
      const bbox = await page.evaluate(() => window.__pilotBBox);
      const [sx, sy, sz] = bbox.size;
      const expW = recipe.studs.w * STUD;
      const expD = recipe.studs.d * STUD;
      const expH = recipeHeight(recipe.shape, recipe.heightPlates);
      const matchesDirect = withinTolerance(sx, expW) && withinTolerance(sz, expD);
      const matchesSwapped = withinTolerance(sx, expD) && withinTolerance(sz, expW);
      const footprintOk = matchesDirect || matchesSwapped;
      r.measured = { size: bbox.size, expected: [expW, expH, expD] };
      r.validation = footprintOk ? 'footprint-ok' : 'footprint-mismatch';
      r.measuredHeight = sy;
    } catch (err) {
      r.validation = 'render-error';
      r.renderError = err.message;
    }
    await page.close();
  }

  await browser.close();
  server.close();

  const ok = results.filter((r) => r.validation === 'footprint-ok').length;
  const mismatch = results.filter((r) => r.validation === 'footprint-mismatch').length;
  const noEntry = results.filter((r) => r.validation === 'no-catalog-entry').length;
  const renderErr = results.filter((r) => r.validation === 'render-error').length;

  console.log(`\n== Validation summary ==`);
  console.log(`  footprint-ok: ${ok}`);
  console.log(`  footprint-mismatch (kept parametric, logged): ${mismatch}`);
  console.log(`  no-catalog-entry: ${noEntry}`);
  console.log(`  render-error: ${renderErr}`);
  if (mismatch) {
    console.log('  Mismatched ids:', results.filter((r) => r.validation === 'footprint-mismatch').map((r) => r.brickId));
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(results, null, 2));
  console.log(`\nReport written to ${path.relative(ROOT, REPORT_PATH)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
