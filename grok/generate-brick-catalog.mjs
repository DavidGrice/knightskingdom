/**
 * Generates brickCatalog.generated.js from workshop bucket modelPaths.
 * Run: node grok/generate-brick-catalog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const INDEX = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/index.js',
);
const OUT = path.join(
  ROOT,
  'src/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/WorkshopEngine/brickCatalog.generated.js',
);

/** @type {Record<string, object>} */
const LEGO_PARTS = {
  3001: { shape: 'BOX', studs: { w: 2, d: 4 }, heightPlates: 3, name: 'Brick 2×4' },
  3002: { shape: 'BOX', studs: { w: 2, d: 3 }, heightPlates: 3, name: 'Brick 2×3' },
  3003: { shape: 'BOX', studs: { w: 2, d: 2 }, heightPlates: 3, name: 'Brick 2×2' },
  3004: { shape: 'BOX', studs: { w: 1, d: 2 }, heightPlates: 3, name: 'Brick 1×2' },
  3005: { shape: 'BOX', studs: { w: 1, d: 1 }, heightPlates: 3, name: 'Brick 1×1' },
  3006: { shape: 'BOX', studs: { w: 2, d: 10 }, heightPlates: 3, name: 'Brick 2×10' },
  3007: { shape: 'BOX', studs: { w: 1, d: 8 }, heightPlates: 3, name: 'Brick 1×8' },
  3008: { shape: 'BOX', studs: { w: 1, d: 8 }, heightPlates: 3, name: 'Brick 1×8' },
  3009: { shape: 'BOX', studs: { w: 1, d: 6 }, heightPlates: 3, name: 'Brick 1×6' },
  3010: { shape: 'BOX', studs: { w: 1, d: 4 }, heightPlates: 3, name: 'Brick 1×4' },
  3011: { shape: 'BOX', studs: { w: 2, d: 8 }, heightPlates: 3, name: 'Brick 2×8' },
  3622: { shape: 'BOX', studs: { w: 1, d: 3 }, heightPlates: 3, name: 'Brick 1×3' },
  2456: { shape: 'BOX', studs: { w: 2, d: 6 }, heightPlates: 3, name: 'Brick 2×6' },
  3002: { shape: 'BOX', studs: { w: 2, d: 3 }, heightPlates: 3, name: 'Brick 2×3' },
  3020: { shape: 'PLATE', studs: { w: 2, d: 4 }, heightPlates: 1, name: 'Plate 2×4' },
  3021: { shape: 'PLATE', studs: { w: 2, d: 3 }, heightPlates: 1, name: 'Plate 2×3' },
  3022: { shape: 'PLATE', studs: { w: 2, d: 2 }, heightPlates: 1, name: 'Plate 2×2' },
  3023: { shape: 'PLATE', studs: { w: 1, d: 2 }, heightPlates: 1, name: 'Plate 1×2' },
  3024: { shape: 'PLATE', studs: { w: 1, d: 1 }, heightPlates: 1, name: 'Plate 1×1' },
  3029: { shape: 'PLATE', studs: { w: 1, d: 4 }, heightPlates: 1, name: 'Plate 1×4' },
  3030: { shape: 'PLATE', studs: { w: 2, d: 10 }, heightPlates: 1, name: 'Plate 2×10' },
  3031: { shape: 'PLATE', studs: { w: 4, d: 4 }, heightPlates: 1, name: 'Plate 4×4' },
  3032: { shape: 'PLATE', studs: { w: 2, d: 6 }, heightPlates: 1, name: 'Plate 2×6' },
  3034: { shape: 'PLATE', studs: { w: 2, d: 8 }, heightPlates: 1, name: 'Plate 2×8' },
  3036: { shape: 'PLATE', studs: { w: 1, d: 6 }, heightPlates: 1, name: 'Plate 1×6' },
  3037: { shape: 'PLATE', studs: { w: 2, d: 6 }, heightPlates: 1, name: 'Plate 2×6' },
  3710: { shape: 'PLATE', studs: { w: 1, d: 4 }, heightPlates: 1, name: 'Plate 1×4' },
  3460: { shape: 'PLATE', studs: { w: 1, d: 3 }, heightPlates: 1, name: 'Plate 1×3' },
  3623: { shape: 'PLATE', studs: { w: 1, d: 3 }, heightPlates: 1, name: 'Plate 1×3' },
  3040: { shape: 'SLOPE', studs: { w: 2, d: 1 }, heightPlates: 2, name: 'Slope 45° 2×1' },
  3043: { shape: 'SLOPE', studs: { w: 2, d: 2 }, heightPlates: 2, name: 'Slope 45° 2×2' },
  3044: { shape: 'SLOPE', studs: { w: 1, d: 2 }, heightPlates: 2, name: 'Slope 45° 1×2' },
  3045: { shape: 'SLOPE', studs: { w: 2, d: 1 }, heightPlates: 2, name: 'Slope 45° inv 2×1' },
  3039: { shape: 'SLOPE', studs: { w: 2, d: 2 }, heightPlates: 2, name: 'Slope 45° 2×2' },
  3048: { shape: 'SLOPE', studs: { w: 2, d: 2 }, heightPlates: 2, name: 'Slope 45° 2×2' },
  3298: { shape: 'SLOPE', studs: { w: 2, d: 4 }, heightPlates: 2, name: 'Slope 45° 2×4' },
  3037: { shape: 'SLOPE', studs: { w: 2, d: 4 }, heightPlates: 2, name: 'Slope 45° 2×4' },
  3062: { shape: 'CYLINDER', studs: { w: 1, d: 1 }, heightPlates: 3, name: 'Round 1×1' },
  3069: { shape: 'TILE', studs: { w: 1, d: 2 }, heightPlates: 1, showStuds: false, name: 'Tile 1×2' },
  3070: { shape: 'TILE', studs: { w: 1, d: 1 }, heightPlates: 1, showStuds: false, name: 'Tile 1×1' },
  3068: { shape: 'TILE', studs: { w: 2, d: 2 }, heightPlates: 1, showStuds: false, name: 'Tile 2×2' },
  2431: { shape: 'TILE', studs: { w: 1, d: 4 }, heightPlates: 1, showStuds: false, name: 'Tile 1×4' },
  6636: { shape: 'TILE', studs: { w: 1, d: 6 }, heightPlates: 1, showStuds: false, name: 'Tile 1×6' },
  4162: { shape: 'TILE', studs: { w: 2, d: 2 }, heightPlates: 1, showStuds: false, name: 'Tile 2×2' },
  3069: { shape: 'TILE', studs: { w: 1, d: 2 }, heightPlates: 1, showStuds: false, name: 'Tile 1×2' },
  4490: { shape: 'ARCH', studs: { w: 2, d: 1 }, heightPlates: 3, name: 'Arch 1×2' },
  3659: { shape: 'ARCH', studs: { w: 1, d: 2 }, heightPlates: 3, name: 'Arch 1×2' },
  6182: { shape: 'ARCH', studs: { w: 2, d: 4 }, heightPlates: 3, name: 'Arch 2×4' },
  2339: { shape: 'ARCH', studs: { w: 2, d: 2 }, heightPlates: 3, name: 'Arch 2×2' },
  3455: { shape: 'ARCH', studs: { w: 2, d: 2 }, heightPlates: 3, name: 'Arch 2×2' },
  3307: { shape: 'ARCH', studs: { w: 2, d: 1 }, heightPlates: 3, name: 'Arch 2×1' },
  30272: { shape: 'ARCH', studs: { w: 2, d: 2 }, heightPlates: 3, name: 'Arch 2×2' },
  4070: { shape: 'COMPOSITE', studs: { w: 1, d: 1 }, heightPlates: 3, name: 'Headlight' },
  4079: { shape: 'COMPOSITE', studs: { w: 1, d: 2 }, heightPlates: 3, name: 'Seat' },
  4151: { shape: 'COMPOSITE', studs: { w: 2, d: 2 }, heightPlates: 2, name: 'Panel' },
  4201: { shape: 'COMPOSITE', studs: { w: 2, d: 2 }, heightPlates: 3, name: 'Brick 2×2' },
  4204: { shape: 'COMPOSITE', studs: { w: 1, d: 1 }, heightPlates: 3, name: 'Brick 1×1' },
  4033: { shape: 'COMPOSITE', studs: { w: 2, d: 2 }, heightPlates: 4, name: 'Window' },
  4071: { shape: 'COMPOSITE', studs: { w: 2, d: 4 }, heightPlates: 5, name: 'Door frame' },
  4532: { shape: 'COMPOSITE', studs: { w: 2, d: 4 }, heightPlates: 5, name: 'Door' },
  3185: { shape: 'COMPOSITE', studs: { w: 2, d: 6 }, heightPlates: 4, name: 'Fence' },
};

const CATEGORY_FALLBACKS = {
  basic: { shape: 'BOX', studs: { w: 2, d: 2 }, heightPlates: 3 },
  slim: { shape: 'PLATE', studs: { w: 1, d: 2 }, heightPlates: 1 },
  wedge: { shape: 'SLOPE', studs: { w: 2, d: 1 }, heightPlates: 2 },
  cylindrical: { shape: 'CYLINDER', studs: { w: 1, d: 1 }, heightPlates: 3 },
  arches: { shape: 'ARCH', studs: { w: 2, d: 2 }, heightPlates: 3 },
  castle_components: { shape: 'COMPOSITE', studs: { w: 2, d: 2 }, heightPlates: 3 },
  castle_accessories: { shape: 'COMPOSITE', studs: { w: 1, d: 2 }, heightPlates: 2 },
  windows_doors_fences: { shape: 'COMPOSITE', studs: { w: 2, d: 4 }, heightPlates: 5 },
  tiles: { shape: 'TILE', studs: { w: 1, d: 1 }, heightPlates: 1, showStuds: false },
  challenges: { shape: 'BOX', studs: { w: 2, d: 4 }, heightPlates: 3 },
};

const CHALLENGE_RECIPES = {
  c5_2x4: { shape: 'BOX', studs: { w: 2, d: 4 }, heightPlates: 3, name: 'Challenge 2×4' },
  c5_door: { shape: 'COMPOSITE', studs: { w: 2, d: 4 }, heightPlates: 6, name: 'Challenge door' },
  c5_window: { shape: 'COMPOSITE', studs: { w: 2, d: 2 }, heightPlates: 4, name: 'Challenge window' },
  c5_roof: { shape: 'SLOPE', studs: { w: 2, d: 4 }, heightPlates: 2, name: 'Challenge roof' },
};

function extractEntries(source) {
  const re = /modelPath:\s*'\.\/([^']+)'/g;
  const entries = [];
  let m;
  while ((m = re.exec(source)) !== null) {
    const modelPath = `./${m[1]}`;
    const category = m[1].split('/')[0];
    const slug = m[1].split('/').pop();
    const lMatch = slug.match(/l(\d+)/i);
    const brickId = lMatch ? `l${lMatch[1]}` : slug;
    entries.push({ brickId, category, modelPath, slug });
  }
  return entries;
}

function partCandidates(digits) {
  const out = new Set();
  for (let len = 6; len >= 3; len -= 1) {
    if (digits.length >= len) {
      out.add(digits.slice(-len).replace(/^0+/, '') || digits.slice(-len));
      out.add(digits.slice(0, len).replace(/^0+/, '') || digits.slice(0, len));
    }
  }
  out.add(digits.replace(/^0+/, '') || digits);
  return [...out];
}

function lookupPart(digits) {
  for (const key of partCandidates(digits)) {
    if (LEGO_PARTS[key]) {
      return { ...LEGO_PARTS[key] };
    }
  }
  return null;
}

function recipeForEntry(entry) {
  if (CHALLENGE_RECIPES[entry.brickId]) {
    return { ...CHALLENGE_RECIPES[entry.brickId], category: entry.category };
  }
  const digits = entry.brickId.replace(/^l/i, '');
  const fromPart = lookupPart(digits);
  if (fromPart) {
    return { ...fromPart, category: entry.category };
  }
  const fallback = CATEGORY_FALLBACKS[entry.category] || CATEGORY_FALLBACKS.basic;
  return {
    ...fallback,
    name: `${entry.category} ${entry.brickId}`,
    category: entry.category,
  };
}

const source = fs.readFileSync(INDEX, 'utf8');
const entries = extractEntries(source);
const catalog = {};

for (const entry of entries) {
  catalog[entry.brickId] = recipeForEntry(entry);
}

// Overlay real, LCA-derived GLB geometry (see resources/model_files/
// convert_bricks.mjs) for bricks whose converted mesh matches its declared
// stud footprint within tolerance. Parts the fuzzy digit-matched LEGO_PARTS
// lookup guessed wrong (a real, common case -- e.g. l420100 is actually a
// large multi-stud baseplate, not the small composite guessed above) keep
// their current parametric shape unchanged: no regression, same as before
// this pipeline existed. studs/heightPlates are deliberately left as-is
// even for GLB-shaped entries -- BrickFactory's stacking/height math reads
// them regardless of shape, and they still describe the catalog's intended
// footprint.
const REPORT_PATH = path.join(ROOT, 'resources/model_files/brick_conversion_report.json');
const BRICKS_DIR = path.join(ROOT, 'public/workshop/bricks');
// OBJ/MTL is the live path (see BrickFactory.js) -- sidesteps whatever the
// obj2gltf GLB conversion above was doing to orientation/winding. GLB stays
// generated too (non-live fallback/reference), same footprint-validated set.
const OBJ_MTL_DIR = path.join(ROOT, 'public/models/bricks');
let glbOverlayCount = 0;
if (fs.existsSync(REPORT_PATH)) {
  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const validated = new Set(
    report.filter((r) => r.validation === 'footprint-ok').map((r) => r.brickId),
  );
  for (const brickId of Object.keys(catalog)) {
    if (!validated.has(brickId)) continue;
    if (!fs.existsSync(path.join(BRICKS_DIR, `${brickId}.glb`))) continue;
    catalog[brickId] = {
      ...catalog[brickId],
      shape: 'GLB',
      glbUrl: `/workshop/bricks/${brickId}.glb`,
    };
    if (
      fs.existsSync(path.join(OBJ_MTL_DIR, `${brickId}.obj`))
      && fs.existsSync(path.join(OBJ_MTL_DIR, `${brickId}.mtl`))
    ) {
      catalog[brickId].objUrl = `/models/bricks/${brickId}.obj`;
      catalog[brickId].mtlUrl = `/models/bricks/${brickId}.mtl`;
    }
    glbOverlayCount += 1;
  }
}

const header = `/**
 * AUTO-GENERATED by grok/generate-brick-catalog.mjs — do not edit by hand.
 * Regenerate: node grok/generate-brick-catalog.mjs
 * Entries: ${entries.length} (${glbOverlayCount} with LCA-derived GLB geometry)
 */
`;

const body = `${header}export const GENERATED_BRICK_CATALOG = ${JSON.stringify(catalog, null, 2)};\n`;
fs.writeFileSync(OUT, body);
console.log(`  (${glbOverlayCount} entries overlaid with validated GLB geometry)`);
console.log(`Wrote ${entries.length} catalog entries to ${path.relative(ROOT, OUT)}`);