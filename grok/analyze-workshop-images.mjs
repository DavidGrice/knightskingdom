/**
 * Pixel analysis for workshop UI assets.
 * Run: node grok/analyze-workshop-images.mjs
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WS = path.join(ROOT, 'src/Components/MainMenuStack/StartStack/MainGameStack/WorkShop');

const assets = {
  background: path.join(WS, 'WorkShopResourceStack/background.png'),
  overlayTop: path.join(WS, 'ComponentTop/ComponentTopResourceStack/overlay_top.png'),
  overlayBottom: path.join(WS, 'ComponentBottom/ComponentBottomResourceStack/overlay_bottom.png'),
  dropDown: path.join(WS, 'ComponentTop/Bucket/BucketResourceStack/drop_down.png'),
  colorMixer: path.join(WS, 'ComponentTop/Palette/PaletteResourceStack/color_mixer_board.png'),
};

async function loadRgba(file) {
  const img = sharp(file);
  const meta = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, meta };
}

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isRedPixel(data, i) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  return r > 150 && r > g * 1.6 && r > b * 1.4;
}

async function analyzeBackground(data, width, height) {
  let redMinX = width;
  let redMaxX = 0;
  for (let y = 103; y < height - 126; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isRedPixel(data, i)) {
        redMinX = Math.min(redMinX, x);
        redMaxX = Math.max(redMaxX, x);
      }
    }
  }
  return {
    redPanel: { x: redMinX, width: redMaxX - redMinX + 1 },
    blackViewport: { x: redMaxX + 1, width: width - redMaxX - 1 },
    topBarZone: { y: 0, height: 103 },
    bottomBarZone: { y: height - 126, height: 126 },
  };
}

async function analyzeDropDown(data, width, height) {
  const isDark = (x, y, t = 42) => {
    const i = (y * width + x) * 4;
    return data[i + 3] > 100 && lum(data[i], data[i + 1], data[i + 2]) < t;
  };

  let up = { x: 0, y: 0, L: 0 };
  let down = { x: 0, y: 0, L: 0 };
  for (let y = 180; y < 280; y++) {
    for (let x = 50; x < 190; x++) {
      const i = (y * width + x) * 4;
      const L = lum(data[i], data[i + 1], data[i + 2]);
      if (L > up.L) up = { x, y, L };
    }
  }
  for (let y = 490; y < 540; y++) {
    for (let x = 50; x < 190; x++) {
      const i = (y * width + x) * 4;
      const L = lum(data[i], data[i + 1], data[i + 2]);
      if (L > down.L) down = { x, y, L };
    }
  }

  const gridLeft = 24;
  const cellW = 95;
  const gapX = 24;
  const cellH = 67;
  const rows = [];
  for (let y = 250; y < 520; y += 3) {
    let score = 0;
    for (let dy = 0; dy < cellH; dy++) {
      for (let dx = 0; dx < cellW; dx++) {
        if (isDark(gridLeft + dx, y + dy)) score++;
        if (isDark(gridLeft + cellW + gapX + dx, y + dy)) score++;
      }
    }
    if (score > 8000) rows.push({ y, score });
  }
  const rowBands = [];
  for (const r of rows) {
    const last = rowBands[rowBands.length - 1];
    if (!last || r.y - last.y > 15) rowBands.push(r);
  }

  return {
    holder: { width, height },
    upArrow: { x: up.x, y: up.y },
    downArrow: { x: down.x, y: down.y },
    grid: {
      gridLeft,
      cellW,
      cellH,
      gapX,
      rowBands: rowBands.slice(0, 4),
      suggestedGridTop: rowBands[0]?.y ?? 303,
    },
    legacyDerivedGridTop: Math.round(height * 0.35 + height * 0.65 * 0.30),
  };
}

async function main() {
  console.log('WORKSHOP IMAGE ANALYSIS REPORT');
  console.log('==============================\n');

  console.log('## Asset dimensions\n');
  for (const [key, file] of Object.entries(assets)) {
    const { width, height } = await loadRgba(file);
    console.log(`  ${key.padEnd(14)} ${width} x ${height}`);
  }

  const bg = await loadRgba(assets.background);
  const landmarks = await analyzeBackground(bg.data, bg.width, bg.height);
  console.log('\n## background.png landmarks (800x600)\n');
  console.log('  Red bucket panel (left):', landmarks.redPanel);
  console.log('  Black 3D viewport:', landmarks.blackViewport);
  console.log('  Top bar zone: y 0-103');
  console.log('  Bottom bar zone: y 474-600');
  console.log(`  → drop_down (238px) fits in red panel: x=${landmarks.redPanel.x} (panel w=${landmarks.redPanel.width})`);
  console.log(`  → Legacy CSS left 29.15% = ${(0.2915 * 800).toFixed(1)}px (RIGHT edge of red panel — incorrect)`);

  const drop = await loadRgba(assets.dropDown);
  const holder = await analyzeDropDown(drop.data, drop.width, drop.height);
  console.log('\n## drop_down.png (238x556 brick holder)\n');
  console.log('  Visual: glossy red bucket; brick area is uniform dark-red recess (NOT black slots like MyModels)');
  console.log('  Up arrow peak:', holder.upArrow);
  console.log('  Down arrow peak:', holder.downArrow);
  console.log('  2-column grid math: 24 + 95 + 24 + 95 = 238px (full width)');
  console.log('  Legacy %-derived gridTop:', holder.legacyDerivedGridTop);
  console.log('  Dark row band scan:', holder.grid.rowBands.map((r) => `y=${r.y}`).join(', ') || 'none');
  console.log('  Current code WORKSHOP_BUCKET gridTop: 303');
  console.log('  Current code upArrow: (119,248) downArrow: (119,518)');

  console.log('\n## overlay_top.png (783x103 → stretched to 800px)\n');
  console.log('  Stretch factor: 800/783 = 1.0217 (2.17% wider)');
  console.log('  Visual: grid panel LEFT, empty display window RIGHT');
  console.log('  CSS bucketButton margin-left 35px targets left grid panel');
  console.log('  Background top slot sits over BLACK viewport (x>250), not centered on 800px canvas');

  console.log('\n## overlay_bottom.png (784x126 → stretched to 800px)\n');
  console.log('  Visual: symmetric clouds + center circle knob (anchor for Ball/zoom)');
  console.log('  Center circle is horizontal midpoint of overlay (~400px)');

  console.log('\n## palette / color_mixer_board.png\n');
  console.log('  Size 196x196');
  console.log(`  Legacy right 29.2% → x=${(800 - 0.292 * 800 - 196).toFixed(1)} (matches palettePanel x=370)`);

  console.log('\n## Current workshopStageMetrics.js\n');
  console.log('  barOffsetX: 32');
  console.log('  bucketPanel: x=8, y=103');
  console.log('  palettePanel: x=370, y=60');
  console.log(`  Image-measured bucketPanel.x should be ~${landmarks.redPanel.x}`);

  console.log('\n## Coordinate system\n');
  console.log('  workshopRoot → 800px .stage (centered) → CSS vars');
  console.log('  GameShell toolbars: +barOffsetX from center');
  console.log('  Bucket/palette: positioned on .stage (not affected by barOffsetX)');
  console.log('  Toolbar bucket icon and bucket dropdown are DIFFERENT anchors by design');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});