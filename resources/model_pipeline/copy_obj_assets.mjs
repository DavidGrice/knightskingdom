#!/usr/bin/env node
/**
 * copy_obj_assets.mjs -- populate public/models/ with the OBJ/MTL runtime
 * asset tree consumed directly by OBJLoader/MTLLoader at runtime (the "live"
 * path per the "Wire real 3D models" plan's OBJ/MTL pivot). This is a plain
 * file copy -- no conversion, no scale/orientation baking; those are applied
 * at load time (see objMtlLoader.js in both engines).
 *
 * Layout:
 *   public/models/textures/                 shared 305-file texture bank
 *   public/models/warehouse/<category>/[<subfolder>/]<id>.{obj,mtl}  Track A
 *   public/models/bricks/<brickId>.{obj,mtl}                          Track B
 *
 * Idempotent: skips a copy if the destination is already newer than source.
 * Usage: node resources/model_pipeline/copy_obj_assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const MODEL_FILES = path.join(ROOT, 'resources', 'model_files');
const MODELS_DIR = path.join(MODEL_FILES, 'extracted', 'models');
const TEXTURES_SRC = path.join(MODELS_DIR, 'textures');
const PAK_ROOT = path.join(MODEL_FILES, 'extracted', 'pak', 'warehouse', 'main_interface');
const WORKSHOP_BUCKET_DIR = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack',
);

const PUBLIC_MODELS = path.join(ROOT, 'public', 'models');
const TEXTURES_OUT = path.join(PUBLIC_MODELS, 'textures');
const WAREHOUSE_OUT = path.join(PUBLIC_MODELS, 'warehouse');
const BRICKS_OUT = path.join(PUBLIC_MODELS, 'bricks');

function walk(dir, pred, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, pred, base));
    } else if (pred(entry.name)) {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

function copyIfNewer(src, dest) {
  if (!fs.existsSync(src)) return false;
  if (fs.existsSync(dest) && fs.statSync(dest).mtimeMs >= fs.statSync(src).mtimeMs) {
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return true;
}

function extractBrickId(objId) {
  const lMatch = objId.match(/l(\d+)/i);
  if (lMatch) return `l${lMatch[1]}`;
  return objId;
}

function main() {
  // 1) shared texture bank
  let texCopied = 0;
  fs.mkdirSync(TEXTURES_OUT, { recursive: true });
  for (const f of fs.readdirSync(TEXTURES_SRC)) {
    if (copyIfNewer(path.join(TEXTURES_SRC, f), path.join(TEXTURES_OUT, f))) texCopied += 1;
  }
  console.log(`textures: ${texCopied} copied (of ${fs.readdirSync(TEXTURES_SRC).length})`);

  // 2) Track A -- warehouse
  const lcaRels = walk(PAK_ROOT, (n) => n.toLowerCase().endsWith('.lca'));
  let warehouseCopied = 0;
  let warehouseMissing = 0;
  for (const rel of lcaRels) {
    const id = path.basename(rel, '.lca');
    const relDir = path.dirname(rel);
    for (const ext of ['obj', 'mtl']) {
      const src = path.join(MODELS_DIR, `${id}.${ext}`);
      const dest = path.join(WAREHOUSE_OUT, relDir, `${id}.${ext}`);
      if (!fs.existsSync(src)) {
        if (ext === 'obj') warehouseMissing += 1;
        continue;
      }
      if (copyIfNewer(src, dest)) warehouseCopied += 1;
    }
  }
  console.log(`warehouse (Track A): ${warehouseCopied} files copied, ${warehouseMissing} ids missing source, from ${lcaRels.length} ids`);

  // 3) Track B -- bricks
  const brickLcaRels = walk(WORKSHOP_BUCKET_DIR, (n) => n.toLowerCase().endsWith('.lca'));
  let bricksCopied = 0;
  let bricksMissing = 0;
  for (const rel of brickLcaRels) {
    const objId = path.basename(rel, '.lca');
    const brickId = extractBrickId(objId);
    for (const ext of ['obj', 'mtl']) {
      const src = path.join(MODELS_DIR, `${objId}.${ext}`);
      const dest = path.join(BRICKS_OUT, `${brickId}.${ext}`);
      if (!fs.existsSync(src)) {
        if (ext === 'obj') bricksMissing += 1;
        continue;
      }
      if (copyIfNewer(src, dest)) bricksCopied += 1;
    }
  }
  console.log(`bricks (Track B): ${bricksCopied} files copied, ${bricksMissing} ids missing source, from ${brickLcaRels.length} ids`);
}

main();
