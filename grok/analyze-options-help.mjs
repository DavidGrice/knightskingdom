/**
 * Measure Richard help bin hole + frame circle on options assets.
 * Run: node grok/analyze-options-help.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const {
  OPTIONS_HELP_HOLE,
  OPTIONS_HELP_LAYOUT_SCALE,
  buildOptionsLayoutContract,
} = require('../src/Components/Common/MenuStageLayout/optionsLayoutMath.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN = path.join(
  __dirname,
  '../src/Components/MainMenuStack/Options/OptionsResourceStack/richard_placeholder.png',
);

async function loadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    return null;
  }
}

function isHole(data, i) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  return a > 200 && r <= 40 && g <= 40 && b <= 70;
}

async function main() {
  const sharp = await loadSharp();
  if (!sharp || !fs.existsSync(BIN)) {
    console.log('Coded contract:', buildOptionsLayoutContract());
    process.exit(0);
  }

  const { data, info } = await sharp(BIN).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const hole = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isHole(data, i)) {
        hole.push([x, y]);
      }
    }
  }

  let cx = 0;
  let cy = 0;
  for (const [x, y] of hole) {
    cx += x;
    cy += y;
  }
  cx /= hole.length;
  cy /= hole.length;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  for (const [x, y] of hole) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  const measuredHole = {
    cx: Math.round(cx),
    cy: Math.round(cy),
    diameter: Math.max(maxX - minX + 1, maxY - minY + 1),
  };

  console.log('OPTIONS HELP ANALYSIS\n');
  console.log('Measured hole (native):', measuredHole);
  console.log('Coded hole (native):', OPTIONS_HELP_HOLE);
  const contract = buildOptionsLayoutContract();
  console.log('Layout scale (display):', OPTIONS_HELP_LAYOUT_SCALE);
  console.log('Alignment @ scale 1:', contract.alignmentNative);
  console.log('Contract (scaled):', contract);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});