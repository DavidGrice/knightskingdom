#!/usr/bin/env node
/**
 * convert_template_parts.mjs -- Track C/D -> GLB. Converts the per-template
 * per-shape parts (export_template_parts.py's output, ~615 files across 9
 * templates) and the 9 merged template bakes to self-contained .glb, written
 * alongside their already-copied OBJ/MTL under public/models/maps/ (Track
 * C/D's existing output dirs from copy_obj_assets.mjs). Reuses
 * convertObjToGlb/isUpToDate from obj2gltfHelper.mjs unchanged -- the same
 * conversion already proven out for warehouse props (Track A,
 * convert_warehouse.mjs) and bricks (Track B, convert_bricks.mjs).
 *
 * Source OBJ/MTL for per-shape parts don't carry their own `textures/`
 * copy (only the shared extracted/textures/ bank does) -- obj2gltf resolves
 * `map_Kd textures/foo.png` purely by joining the MTL's own directory, so
 * this ensures a `textures` directory junction inside each template's
 * parts/ folder pointing at the shared bank before converting (idempotent;
 * Windows junctions need no elevated privileges, unlike regular symlinks).
 * The 9 merged template bakes live in extracted/models/ alongside the 264
 * standalone models, which already has its own textures/ copy (see
 * extract_all.py step 4), so no junction is needed for those.
 *
 * Does not touch MapPlacementsLoader.jsx or any live loader path -- these
 * GLBs are produced and sit next to the existing OBJ/MTL, ready for a
 * future decision about whether/how the engine consumes them.
 *
 * Usage: node resources/model_pipeline/convert_template_parts.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertObjToGlb, isUpToDate } from './obj2gltfHelper.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const MODEL_FILES = path.join(ROOT, 'resources', 'model_files');
const MODELS_DIR = path.join(MODEL_FILES, 'extracted', 'models');
const TEMPLATES_DIR = path.join(MODEL_FILES, 'extracted', 'templates');
const TEXTURES_SRC = path.join(MODEL_FILES, 'extracted', 'textures');
const MAPS_OUT = path.join(ROOT, 'public', 'models', 'maps');
const TEMPLATE_COUNT = 9;

function ensureTexturesJunction(partsDir) {
  const link = path.join(partsDir, 'textures');
  if (fs.existsSync(link) || !fs.existsSync(TEXTURES_SRC)) {
    return;
  }
  fs.symlinkSync(TEXTURES_SRC, link, process.platform === 'win32' ? 'junction' : 'dir');
}

async function convertOne(objPath, glbPath, label, counters) {
  if (!fs.existsSync(objPath)) {
    counters.missing += 1;
    return;
  }
  const mtlPath = objPath.replace(/\.obj$/i, '.mtl');
  if (isUpToDate(glbPath, [objPath, mtlPath])) {
    counters.skipped += 1;
    return;
  }
  try {
    const { warnings, size } = await convertObjToGlb(objPath, glbPath);
    counters.converted += 1;
    const warnMsg = warnings.length ? ` (${warnings.length} warning(s))` : '';
    console.log(`  ${label} -> ${path.relative(ROOT, glbPath)} [${(size / 1024).toFixed(1)} KB]${warnMsg}`);
  } catch (err) {
    counters.failed.push({ label, error: err.message });
    console.log(`!! FAILED converting ${label}: ${err.message}`);
  }
}

async function main() {
  const counters = { converted: 0, skipped: 0, missing: 0, failed: [] };

  // Merged template bakes -- source already has its own textures/ copy.
  for (let n = 1; n <= TEMPLATE_COUNT; n += 1) {
    const id = `template-0${n}`;
    const objPath = path.join(MODELS_DIR, `${id}.obj`);
    const glbPath = path.join(MAPS_OUT, `${id}.glb`);
    await convertOne(objPath, glbPath, id, counters);
  }

  // Per-shape parts.
  if (fs.existsSync(TEMPLATES_DIR)) {
    for (const entry of fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const templateId = entry.name;
      const partsSrcDir = path.join(TEMPLATES_DIR, templateId, 'parts');
      if (!fs.existsSync(partsSrcDir)) continue;
      ensureTexturesJunction(partsSrcDir);
      const objFiles = fs.readdirSync(partsSrcDir).filter((f) => f.toLowerCase().endsWith('.obj'));
      for (const f of objFiles) {
        const shapeId = path.basename(f, '.obj');
        const objPath = path.join(partsSrcDir, f);
        const glbPath = path.join(MAPS_OUT, templateId, 'parts', `${shapeId}.glb`);
        await convertOne(objPath, glbPath, `${templateId}/${shapeId}`, counters);
      }
    }
  }

  console.log('\n== Track C/D GLB conversion summary ==');
  console.log(`  converted: ${counters.converted}`);
  console.log(`  skipped (already up to date): ${counters.skipped}`);
  console.log(`  missing source: ${counters.missing}`);
  console.log(`  failed: ${counters.failed.length}`);
  if (counters.failed.length) {
    console.log(counters.failed);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
