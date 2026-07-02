#!/usr/bin/env node
/**
 * refresh_warehouse_thumbnails.mjs -- copy the canonical extracted PNG
 * thumbnails (resources/model_files/extracted/pak/warehouse/main_interface/)
 * over the MainGame warehouse bucket's committed PNGs (Track A, see
 * the "Wire real 3D models" plan). Same category/id, same filenames --
 * no import statements or code need to change.
 *
 * Usage: node resources/model_pipeline/refresh_warehouse_thumbnails.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');

const SRC_ROOT = path.join(
  ROOT, 'resources', 'model_files', 'extracted', 'pak', 'warehouse', 'main_interface',
);
const DEST_ROOT = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack',
);

function walkPngs(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkPngs(full, base));
    } else if (entry.name.toLowerCase().endsWith('.png')) {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

const rels = walkPngs(SRC_ROOT);
let copied = 0;
let missingDest = 0;

for (const rel of rels) {
  const src = path.join(SRC_ROOT, rel);
  const dest = path.join(DEST_ROOT, rel);
  if (!fs.existsSync(dest)) {
    missingDest += 1;
    console.log(`-- no matching bucket file, skipping: ${rel}`);
    continue;
  }
  fs.copyFileSync(src, dest);
  copied += 1;
}

console.log(`\nCopied ${copied}/${rels.length} thumbnails into the MainGame bucket.`);
if (missingDest) {
  console.log(`${missingDest} source PNGs had no matching bucket file (not necessarily an error -- see log above).`);
}
