#!/usr/bin/env node
/**
 * generate_model_metadata.mjs -- scans every extracted OBJ/MTL pair
 * (resources/model_files/extracted/models/*.obj + matching .mtl) and emits a
 * single indexable metadata JSON: geometry stats (vertex/face/group counts,
 * bounding box in raw extraction units), per-material properties (Kd/Ks/Ns/d/
 * illum, texture reference + existence check), and derived flags that predict
 * rendering problems -- black materials, missing textures, transparency, and
 * "world-scale" outliers whose bounding box dwarfs the typical prop.
 *
 * This is read-only over resources/model_files/extracted/ (never edits game
 * assets) and writes one JSON report used both to drive loader/catalog
 * decisions and to triage the "some faces don't render" reports.
 *
 * Usage: node resources/model_pipeline/generate_model_metadata.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const MODELS_DIR = path.join(ROOT, 'resources', 'model_files', 'extracted', 'models');
const TEXTURES_DIR = path.join(MODELS_DIR, 'textures');
const OUT_PATH = path.join(__dirname, 'model_metadata.generated.json');

function parseMtl(mtlPath) {
  const materials = {};
  if (!fs.existsSync(mtlPath)) {
    return materials;
  }
  const text = fs.readFileSync(mtlPath, 'utf8');
  let current = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const [key, ...rest] = line.split(/\s+/);
    const args = rest.join(' ');
    switch (key) {
      case 'newmtl':
        current = { name: args, Kd: null, Ka: null, Ks: null, Ns: null, d: null, illum: null, map_Kd: null };
        materials[args] = current;
        break;
      case 'Kd':
      case 'Ka':
      case 'Ks':
        if (current) current[key] = args.split(/\s+/).map(Number);
        break;
      case 'Ns':
        if (current) current.Ns = Number(args);
        break;
      case 'd':
        if (current) current.d = Number(args);
        break;
      case 'Tr':
        // Tr is the inverse of d (Tr 0 == fully opaque); normalize to d if d absent.
        if (current && current.d === null) current.d = 1 - Number(args);
        break;
      case 'illum':
        if (current) current.illum = Number(args);
        break;
      case 'map_Kd':
        if (current) current.map_Kd = args;
        break;
      default:
        break;
    }
  }
  return materials;
}

function parseObj(objPath) {
  const stats = {
    vertexCount: 0,
    normalCount: 0,
    uvCount: 0,
    faceCount: 0,
    groupCount: 0,
    objectCount: 0,
    materialUsage: {},
    bbox: { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] },
  };
  const text = fs.readFileSync(objPath, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('v ')) {
      stats.vertexCount += 1;
      const parts = line.slice(2).trim().split(/\s+/).map(Number);
      for (let i = 0; i < 3; i += 1) {
        if (parts[i] < stats.bbox.min[i]) stats.bbox.min[i] = parts[i];
        if (parts[i] > stats.bbox.max[i]) stats.bbox.max[i] = parts[i];
      }
    } else if (line.startsWith('vn ')) {
      stats.normalCount += 1;
    } else if (line.startsWith('vt ')) {
      stats.uvCount += 1;
    } else if (line.startsWith('f ')) {
      stats.faceCount += 1;
    } else if (line.startsWith('g ')) {
      stats.groupCount += 1;
    } else if (line.startsWith('o ')) {
      stats.objectCount += 1;
    } else if (line.startsWith('usemtl ')) {
      const name = line.slice(7).trim();
      stats.materialUsage[name] = (stats.materialUsage[name] || 0) + 1;
    }
  }
  return stats;
}

function flagMaterial(mat) {
  const flags = [];
  const isBlackKd = Array.isArray(mat.Kd) && mat.Kd.every((c) => c <= 0.02);
  if (isBlackKd && !mat.map_Kd) flags.push('black-untextured');
  if (mat.map_Kd) {
    const texPath = path.join(MODELS_DIR, mat.map_Kd);
    if (!fs.existsSync(texPath)) flags.push('missing-texture');
  }
  if (mat.d !== null && mat.d < 0.999) flags.push('transparent');
  if (mat.Ns !== null && (mat.Ns < 0 || mat.Ns > 1000)) flags.push('ns-out-of-range');
  if (mat.illum !== null && mat.illum === 0 && isBlackKd) flags.push('unlit-black');
  return flags;
}

function main() {
  const objFiles = fs.readdirSync(MODELS_DIR).filter((f) => f.toLowerCase().endsWith('.obj'));
  const models = [];

  for (const objFile of objFiles) {
    const id = objFile.replace(/\.obj$/i, '');
    const objPath = path.join(MODELS_DIR, objFile);
    const mtlPath = path.join(MODELS_DIR, `${id}.mtl`);

    const objStats = parseObj(objPath);
    const materials = parseMtl(mtlPath);

    const materialList = Object.values(materials).map((mat) => ({
      ...mat,
      usageCount: objStats.materialUsage[mat.name] || 0,
      flags: flagMaterial(mat),
    }));

    const referencedButUndefined = Object.keys(objStats.materialUsage).filter((name) => !materials[name]);

    const size = [0, 1, 2].map((i) => objStats.bbox.max[i] - objStats.bbox.min[i]);
    const maxDimension = Math.max(...size);

    const modelFlags = [];
    if (!fs.existsSync(mtlPath)) modelFlags.push('missing-mtl');
    if (referencedButUndefined.length) modelFlags.push('undefined-material-reference');
    if (objStats.normalCount === 0) modelFlags.push('no-explicit-normals');
    if (maxDimension > 3000) modelFlags.push('world-scale-outlier');
    const blackMaterialUsage = materialList
      .filter((m) => m.flags.includes('black-untextured'))
      .reduce((sum, m) => sum + m.usageCount, 0);
    if (objStats.faceCount > 0 && blackMaterialUsage / objStats.faceCount > 0.3) {
      modelFlags.push('mostly-black-material');
    }

    models.push({
      id,
      objPath: path.relative(ROOT, objPath).replace(/\\/g, '/'),
      mtlPath: fs.existsSync(mtlPath) ? path.relative(ROOT, mtlPath).replace(/\\/g, '/') : null,
      vertexCount: objStats.vertexCount,
      normalCount: objStats.normalCount,
      uvCount: objStats.uvCount,
      faceCount: objStats.faceCount,
      groupCount: objStats.groupCount,
      objectCount: objStats.objectCount,
      bbox: {
        min: objStats.bbox.min,
        max: objStats.bbox.max,
        size,
        maxDimension,
      },
      materialCount: materialList.length,
      materials: materialList,
      referencedButUndefinedMaterials: referencedButUndefined,
      flags: modelFlags,
    });
  }

  models.sort((a, b) => a.id.localeCompare(b.id));

  const summary = {
    totalModels: models.length,
    flagCounts: {},
  };
  for (const model of models) {
    for (const flag of model.flags) {
      summary.flagCounts[flag] = (summary.flagCounts[flag] || 0) + 1;
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    source: path.relative(ROOT, MODELS_DIR).replace(/\\/g, '/'),
    summary,
    models,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(report, null, 2));
  console.log(`Scanned ${models.length} models -> ${path.relative(ROOT, OUT_PATH)}`);
  console.log('Flag counts:', summary.flagCounts);
}

main();
