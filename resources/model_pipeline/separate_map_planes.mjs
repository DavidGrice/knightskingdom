#!/usr/bin/env node
/**
 * separate_map_planes.mjs -- de-conflict the coplanar giant planes in the
 * baked template maps (public/models/maps/template-0N.obj).
 *
 * The source templates carry several huge flat faces (water, grass/snow
 * base plates) at IDENTICAL or near-identical Y levels (raw levels -1, 0,
 * +1, with many faces exactly coincident at y=0). The original engine drew
 * them by facet priority; a depth-buffered renderer z-fights them -- the
 * "water flickering through the grass" artifact.
 *
 * Fix: at every Y level that hosts big flat faces from MORE THAN ONE
 * material, keep the majority material where it is and sink each other
 * material's faces by a per-material offset (SEPARATION raw units, ~0.15
 * world units after the runtime 0.1 scale -- comfortably above depth
 * precision at gameplay distances, visually a hairline at shorelines).
 * Only vertices used exclusively by the sunk faces move, so shared shore
 * edges stay welded.
 *
 * Idempotent: tags processed files with a marker comment and skips them.
 * Usage: node resources/model_pipeline/separate_map_planes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAPS_DIR = path.join(__dirname, '..', '..', 'public', 'models', 'maps');

const MARKER = '# plane-separated v1';
const FLAT_EPS = 0.6;        // max Y spread within a face to count as flat
const LEVEL_QUANT = 1;       // Y quantisation for grouping levels (raw units)
const MIN_SPAN = 300;        // min XZ span (raw units) to count as a big plane
const SEPARATION = 1.5;      // raw units each extra material sinks per rank

const processObj = (file) => {
  const src = fs.readFileSync(file, 'utf8');
  if (src.includes(MARKER)) {
    return { file, skipped: true };
  }

  const lines = src.split(/\r?\n/);
  const verts = [];            // [x, y, z] per v-line, in file order
  const vertLine = [];         // line index of each v-line
  const faces = [];            // { vidx: number[], mat: string }
  let mat = '';
  lines.forEach((ln, li) => {
    if (ln.startsWith('v ')) {
      const p = ln.split(/\s+/);
      verts.push([+p[1], +p[2], +p[3]]);
      vertLine.push(li);
    } else if (ln.startsWith('usemtl ')) {
      mat = ln.slice(7).trim();
    } else if (ln.startsWith('f ')) {
      const vidx = ln.split(/\s+/).slice(1).map((t) => parseInt(t.split('/')[0], 10) - 1);
      faces.push({ vidx, mat });
    }
  });

  // big flat faces grouped by quantised Y level
  const levels = new Map(); // level -> Map(mat -> faces[])
  faces.forEach((face) => {
    const ys = face.vidx.map((i) => verts[i][1]);
    const spread = Math.max(...ys) - Math.min(...ys);
    if (spread > FLAT_EPS) return;
    const xs = face.vidx.map((i) => verts[i][0]);
    const zs = face.vidx.map((i) => verts[i][2]);
    const span = Math.max(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...zs) - Math.min(...zs),
    );
    if (span < MIN_SPAN) return;
    const level = Math.round(ys[0] / LEVEL_QUANT) * LEVEL_QUANT;
    if (!levels.has(level)) levels.set(level, new Map());
    const byMat = levels.get(level);
    if (!byMat.has(face.mat)) byMat.set(face.mat, []);
    byMat.get(face.mat).push(face);
  });

  // vertex -> set of materials whose BIG faces use it (for exclusivity)
  const vertMats = new Map();
  levels.forEach((byMat) => {
    byMat.forEach((fcs, m) => {
      fcs.forEach((face) => face.vidx.forEach((i) => {
        if (!vertMats.has(i)) vertMats.set(i, new Set());
        vertMats.get(i).add(m);
      }));
    });
  });
  // also protect vertices shared with any NON-flat face (shore geometry)
  const nonFlatVerts = new Set();
  const flatFaceSet = new Set();
  levels.forEach((byMat) => byMat.forEach((fcs) => fcs.forEach((f) => flatFaceSet.add(f))));
  faces.forEach((face) => {
    if (!flatFaceSet.has(face)) face.vidx.forEach((i) => nonFlatVerts.add(i));
  });

  let sunkMats = 0;
  let sunkVerts = 0;
  levels.forEach((byMat) => {
    if (byMat.size < 2) return;
    // majority material stays; others sink by rank
    const ranked = [...byMat.entries()].sort((a, b) => b[1].length - a[1].length);
    ranked.slice(1).forEach(([m, fcs], rank) => {
      const dy = -SEPARATION * (rank + 1);
      const moved = new Set();
      fcs.forEach((face) => face.vidx.forEach((i) => {
        if (moved.has(i)) return;
        if (nonFlatVerts.has(i)) return;               // welded to shore geometry
        if ((vertMats.get(i)?.size ?? 0) > 1) return;  // shared across materials
        verts[i][1] += dy;
        lines[vertLine[i]] = `v ${verts[i][0]} ${verts[i][1]} ${verts[i][2]}`;
        moved.add(i);
      }));
      if (moved.size) {
        sunkMats += 1;
        sunkVerts += moved.size;
      }
    });
  });

  lines.unshift(`${MARKER} (separate_map_planes.mjs)`);
  fs.writeFileSync(file, lines.join('\n'));
  return { file, sunkMats, sunkVerts };
};

const objs = fs.readdirSync(MAPS_DIR).filter((f) => /^template-\d+\.obj$/.test(f));
objs.forEach((f) => {
  const r = processObj(path.join(MAPS_DIR, f));
  console.log(r.skipped
    ? `${f}: already processed, skipped`
    : `${f}: sank ${r.sunkMats} material plane(s), ${r.sunkVerts} verts`);
});
