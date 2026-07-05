/**
 * Measure the left credits banner on main_image.png (800×600).
 * Run: node grok/analyze-credits-banner.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  CREDITS_BANNER_TRIM,
  computeCreditsScrollPanel,
  buildCreditsLayoutContract,
} = require('../src/Components/Common/MenuStageLayout/creditsLayoutMath.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BG = path.join(
  __dirname,
  '../src/Components/MainMenuStack/Credits/CreditsResourceStack/main_image.png',
);

async function loadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    return null;
  }
}

function isBannerTrim(data, i) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  if (a < 128) return false;
  return r > 200 && g > 170 && b < 100;
}

async function main() {
  const sharp = await loadSharp();
  if (!sharp || !fs.existsSync(BG)) {
    console.log('Need sharp + main_image.png');
    console.log('Coded contract:', buildCreditsLayoutContract());
    process.exit(0);
  }

  const { data, info } = await sharp(BG).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width } = info;

  let minX = width;
  let maxX = 0;
  let minY = 600;
  let maxY = 0;

  for (let y = 0; y < 600; y++) {
    for (let x = 0; x < 360; x++) {
      const i = (y * width + x) * 4;
      if (isBannerTrim(data, i)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const measuredTrim = {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };

  const coded = computeCreditsScrollPanel();
  const measured = computeCreditsScrollPanel({ trim: measuredTrim });

  console.log('CREDITS BANNER ANALYSIS (800×600)\n');
  console.log('Measured trim (left half):', measuredTrim);
  console.log('Coded trim:', CREDITS_BANNER_TRIM);
  console.log('Coded scroll panel:', coded);
  console.log('Measured scroll panel:', measured);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});