/**
 * obj2gltfHelper.mjs -- shared OBJ -> GLB conversion used by both the
 * MainGame warehouse (Track A) and WorkShop brick (Track B) pilot/batch
 * conversion scripts. See the "Wire real 3D models" plan for context.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { NodeIO } from '@gltf-transform/core';

const require = createRequire(import.meta.url);
const obj2gltf = require('obj2gltf');
const io = new NodeIO();

/**
 * Empirically-derived uniform scale applied to every conversion.
 *
 * The extraction toolchain's export_textured.py multiplies raw LCA
 * coordinates by 0.001 and labels the result "meters" in its comments, but
 * pilot measurement (see the "Wire real 3D models" plan, Phase 1B) showed
 * the numbers it actually produces equal true LEGO millimeters (e.g. a
 * known 1-stud brick measures exactly 8.0 x 9.6mm). Both Track A (warehouse
 * props) and Track B (workshop bricks) go through the same export step, so
 * both need the same correction. 0.1 was chosen because it maps the
 * Workshop's own STUD=0.8-world-units-per-8mm-stud convention exactly
 * (8mm * 0.1 = 0.8), and produces plausible human-relative sizes for
 * Track A props when checked against the hand-authored Archer model.
 */
export const MM_TO_WORLD_SCALE = 0.1;

/**
 * Convert one .obj (+ sibling .mtl / shared textures) to a .glb buffer and
 * write it to `outPath`. Returns { warnings } so callers can fail loudly on
 * unresolved texture references instead of silently shipping a broken GLB.
 *
 * @param {string} objPath
 * @param {string} outPath
 * @param {{ scale?: number }} [options] scale defaults to MM_TO_WORLD_SCALE;
 *   pass 1 to opt out (e.g. for raw pilot/debug output).
 */
export async function convertObjToGlb(objPath, outPath, options = {}) {
  const scale = options.scale ?? MM_TO_WORLD_SCALE;
  const warnings = [];
  const originalWarn = console.warn;
  const originalLog = console.log;
  console.warn = (...args) => {
    warnings.push(args.join(' '));
    originalWarn(...args);
  };

  let glb;
  try {
    glb = await obj2gltf(objPath, { binary: true });
  } finally {
    console.warn = originalWarn;
    console.log = originalLog;
  }

  if (scale !== 1) {
    const document = await io.readBinary(glb);
    for (const scene of document.getRoot().listScenes()) {
      for (const node of scene.listChildren()) {
        const [sx, sy, sz] = node.getScale();
        node.setScale([sx * scale, sy * scale, sz * scale]);
      }
    }
    glb = Buffer.from(await io.writeBinary(document));
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, glb);
  return { warnings, size: glb.length };
}

/** Skip-if-already-done, mirroring extract_all.py's convention. */
export function isUpToDate(outPath, sourcePaths) {
  if (!fs.existsSync(outPath)) {
    return false;
  }
  const outMtime = fs.statSync(outPath).mtimeMs;
  return sourcePaths.every((p) => !fs.existsSync(p) || fs.statSync(p).mtimeMs <= outMtime);
}
