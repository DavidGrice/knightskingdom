#!/usr/bin/env node
/**
 * convert_warehouse.mjs -- Phase 2A batch conversion (Track A). Converts
 * every MainGame warehouse .lca's extracted .obj/.mtl to a self-contained
 * .glb, written into the matching category folder under the game's bucket
 * (replacing the now-redundant .lca there). Source .obj/.mtl in
 * resources/model_files/extracted/models/ are never modified.
 *
 * Idempotent: skips any id whose .glb already exists and is newer than its
 * .obj/.mtl source.
 *
 * Usage: node resources/model_files/convert_warehouse.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertObjToGlb, isUpToDate } from './obj2gltfHelper.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const MODELS_DIR = path.join(__dirname, 'extracted', 'models');
const PAK_ROOT = path.join(__dirname, 'extracted', 'pak', 'warehouse', 'main_interface');
const BUCKET_ROOT = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack',
);

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

async function main() {
  const rels = walkLcas(PAK_ROOT); // e.g. "buildings/mc001.lca", "challenges/c2_bricks1/c2_wall.lca"
  let converted = 0;
  let skipped = 0;
  let missing = 0;
  const failures = [];

  for (const rel of rels) {
    const id = path.basename(rel, '.lca');
    const relDir = path.dirname(rel); // e.g. "buildings" or "challenges/c2_bricks1"
    const objPath = path.join(MODELS_DIR, `${id}.obj`);
    const mtlPath = path.join(MODELS_DIR, `${id}.mtl`);
    const glbPath = path.join(BUCKET_ROOT, relDir, `${id}.glb`);
    const lcaInBucket = path.join(BUCKET_ROOT, relDir, `${id}.lca`);

    if (!fs.existsSync(objPath)) {
      console.log(`!! MISSING SOURCE .obj for ${id} (${rel})`);
      missing += 1;
      continue;
    }

    if (isUpToDate(glbPath, [objPath, mtlPath])) {
      skipped += 1;
      continue;
    }

    try {
      const { warnings, size } = await convertObjToGlb(objPath, glbPath);
      converted += 1;
      const warnMsg = warnings.length ? ` (${warnings.length} warning(s))` : '';
      console.log(`  ${rel} -> ${path.relative(ROOT, glbPath)} [${(size / 1024).toFixed(1)} KB]${warnMsg}`);
      if (fs.existsSync(lcaInBucket)) {
        fs.unlinkSync(lcaInBucket);
      }
    } catch (err) {
      console.log(`!! FAILED converting ${id}: ${err.message}`);
      failures.push({ id, error: err.message });
    }
  }

  console.log(`\n== Track A conversion summary ==`);
  console.log(`  converted: ${converted}`);
  console.log(`  skipped (already up to date): ${skipped}`);
  console.log(`  missing source: ${missing}`);
  console.log(`  failed: ${failures.length}`);
  if (failures.length) {
    console.log(failures);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
