/**
 * Generates warehouseModelCatalog.generated.js (model imports + per-id flags
 * keyed WH_<CATEGORY>_<ID>) and rewrites BucketBottomResourceStack/index.js's
 * data-array entries to add `model`/`SelectedModel` (dropping the dead
 * `modelPath` field), using the *existing* PNG import statements as the
 * source of truth for which array entry maps to which converted id --
 * `modelPath` itself is unreliable for the 4 challenges entries (its slug
 * doesn't match their real .lca/.glb basename).
 *
 * Run: node grok/generate-warehouse-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const BUCKET_DIR = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack',
);
const INDEX = path.join(BUCKET_DIR, 'index.js');
const CATALOG_OUT = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/MainGame/GameEngine/Loaders/warehouseModelCatalog.generated.js',
);

function walkGlbs(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkGlbs(full, base));
    } else if (entry.name.toLowerCase().endsWith('.glb')) {
      out.push(path.relative(base, full).replace(/\\/g, '/'));
    }
  }
  return out;
}

function sanitizeKeyPart(s) {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, '_');
}

// relPath e.g. "buildings/mc001" -> { category: 'buildings', id: 'mc001', key: 'WH_BUILDINGS_MC001' }
function infoForRelPath(relPathNoExt) {
  const parts = relPathNoExt.split('/');
  const category = parts[0];
  const id = parts[parts.length - 1];
  const key = `WH_${sanitizeKeyPart(category)}_${sanitizeKeyPart(id)}`;
  return { category, id, key };
}

const glbRels = walkGlbs(BUCKET_DIR).map((p) => p.replace(/\.glb$/i, ''));
const glbSet = new Set(glbRels);

const indexSrc = fs.readFileSync(INDEX, 'utf8').replace(/\r\n/g, '\n');

// 1) map every existing PNG import var -> its relative path (source of truth
//    for which data-array entry corresponds to which converted id)
const pngImportRe = /import\s+(\w+)\s+from\s+'\.\/([^']+)\.png';/g;
const varToRelPath = new Map();
let m;
while ((m = pngImportRe.exec(indexSrc)) !== null) {
  varToRelPath.set(m[1], m[2]);
}

// 1b) scan every data-array entry (boundary-aware, not a cross-object
//     regex) to find which image vars already declare SelectedModel
//     (Archer) -- those must not get a second, unused model import.
function scanEntries(source) {
  const lines = source.split('\n');
  const entries = []; // { startLine, endLine, imageVar, hasSelected }
  let i = 0;
  while (i < lines.length) {
    if (/^ {4}\{$/.test(lines[i])) {
      const start = i;
      i += 1;
      const entryLines = [];
      while (i < lines.length && !/^ {4}\},?$/.test(lines[i])) {
        entryLines.push(lines[i]);
        i += 1;
      }
      const end = i; // index of the closing "    }," line
      i += 1;
      const entryText = entryLines.join('\n');
      const imageMatch = entryText.match(/image:\s*(\w+)/);
      const nameMatch = entryText.match(/name:\s*'([^']+)'/);
      entries.push({
        start,
        end,
        imageVar: imageMatch && imageMatch[1],
        name: nameMatch && nameMatch[1],
        // a WH_-prefixed SelectedModel is one we generated ourselves on a
        // previous run -- safe (and desired) to regenerate/overwrite, so it
        // does NOT count as "foreign" the way a hand-set one (Archer) does
        hasForeignSelected: /SelectedModel:\s*'(?!WH_)/.test(entryText),
      });
    } else {
      i += 1;
    }
  }
  return entries;
}

const scannedEntries = scanEntries(indexSrc);
const alreadyWiredVars = new Set(
  scannedEntries.filter((e) => e.hasForeignSelected && e.imageVar).map((e) => e.imageVar),
);

// 2) build the model-import list + catalog entries for every converted id
//    that has a matching PNG-imported bucket entry and isn't already wired.
//    modelImports only gets entries not already imported in index.js
//    (idempotent re-runs must not duplicate import statements).
const existingModelImportVars = new Set(
  [...indexSrc.matchAll(/^import\s+(\w+)\s+from\s+'\.\/[^']+\.glb';/gm)].map((x) => x[1]),
);
const modelImports = [];
const catalogEntries = [];
const usedImportVars = new Set();

for (const [varName, relPath] of varToRelPath.entries()) {
  if (!glbSet.has(relPath)) continue; // e.g. arrow icons, wh_selection.png
  if (alreadyWiredVars.has(varName)) continue; // e.g. Archer
  const { category, id, key } = infoForRelPath(relPath);
  const importVar = `${varName}Model`;
  if (usedImportVars.has(importVar)) continue;
  usedImportVars.add(importVar);
  if (!existingModelImportVars.has(importVar)) {
    modelImports.push(`import ${importVar} from './${relPath}.glb';`);
  }
  catalogEntries.push({ varName, importVar, key, category, id, relPath });
}

// 3) rewrite index.js's data-array entries: add model/SelectedModel, drop
//    modelPath. Entries that already declare SelectedModel (Archer) are
//    left byte-for-byte untouched.
const varToCatalog = new Map(catalogEntries.map((e) => [e.varName, e]));

function transformDataArrays(source) {
  const lines = source.split('\n');
  const out = [];
  let i = 0;
  let transformed = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^ {4}\{$/.test(line)) {
      out.push(line);
      i += 1;
      const entryLines = [];
      while (i < lines.length && !/^ {4}\},?$/.test(lines[i])) {
        entryLines.push(lines[i]);
        i += 1;
      }
      const closeLine = lines[i];
      i += 1;
      const entryText = entryLines.join('\n');
      const nameMatch = entryText.match(/name:\s*'([^']+)'/);
      const imageMatch = entryText.match(/image:\s*(\w+)/);
      const hasForeignSelected = /SelectedModel:\s*'(?!WH_)/.test(entryText);

      if (hasForeignSelected || !nameMatch || !imageMatch) {
        out.push(...entryLines, closeLine);
        continue;
      }
      const info = varToCatalog.get(imageMatch[1]);
      out.push(`        name: '${nameMatch[1]}',`);
      out.push(`        image: ${imageMatch[1]},`);
      if (info) {
        out.push(`        model: ${info.importVar},`);
        out.push(`        SelectedModel: '${info.key}',`);
        transformed += 1;
      }
      out.push(closeLine);
    } else {
      out.push(line);
      i += 1;
    }
  }
  return { text: out.join('\n'), transformed };
}

const { text: rewrittenBody, transformed } = transformDataArrays(indexSrc);

// insert any NEW model imports right after the last existing png/gltf
// import so they sit with the rest of the file's imports
let finalIndex = rewrittenBody;
if (modelImports.length) {
  const importInsertion = `${modelImports.join('\n')}\n`;
  const lastImportMatch = [...rewrittenBody.matchAll(/^import .+;\r?\n/gm)].pop();
  const insertAt = lastImportMatch.index + lastImportMatch[0].length;
  finalIndex = rewrittenBody.slice(0, insertAt) + importInsertion + rewrittenBody.slice(insertAt);
}

fs.writeFileSync(INDEX, finalIndex);
console.log(`Rewrote ${INDEX}: ${transformed} entries wired to a model, ${modelImports.length} model imports added.`);

// 4) write the generated catalog (flags consumed by ModelLoader.jsx) --
//    re-imports each glb directly so this file is self-contained and
//    doesn't depend on index.js re-exporting anything.
const directImports = catalogEntries
  .map((e) => `import ${e.varName}Model from '../../ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/${e.relPath}.glb';`)
  .join('\n');

const entriesSrc = catalogEntries
  .map((e) => `  ${e.key}: {
    model: ${e.varName}Model,
    objUrl: '/models/warehouse/${e.relPath}.obj',
    mtlUrl: '/models/warehouse/${e.relPath}.mtl',
    name: '${e.category} ${e.id}',
    isMovable: true,
    isDeletable: true,
    isDriveable: false,
    isPaintable: true,
    isRotatable: true,
    isModel: true,
  },`)
  .join('\n');

const catalogSrc = `/**
 * AUTO-GENERATED by grok/generate-warehouse-catalog.mjs -- do not edit by hand.
 * Regenerate: node grok/generate-warehouse-catalog.mjs
 * Entries: ${catalogEntries.length}
 */
${directImports}

export const WAREHOUSE_MODEL_CATALOG = {
${entriesSrc}
};

export const WAREHOUSE_MODEL_IDS = Object.keys(WAREHOUSE_MODEL_CATALOG);
`;

fs.mkdirSync(path.dirname(CATALOG_OUT), { recursive: true });
fs.writeFileSync(CATALOG_OUT, catalogSrc);
console.log(`Wrote ${catalogEntries.length} catalog entries to ${path.relative(ROOT, CATALOG_OUT)}`);
