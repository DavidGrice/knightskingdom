/**
 * Measure profile-column anchors on authentication background.png (800×600).
 * Run: node grok/analyze-auth-background.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BG = path.join(
  __dirname,
  '../src/Components/AuthenticationStack/AuthStackResources/background.png',
);

async function loadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    return null;
  }
}

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** Parchment / cream scroll region — high R+G, moderate B */
function isParchment(data, i) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];
  if (a < 128) return false;
  return r > 180 && g > 160 && b > 100 && r > b * 1.2;
}

async function main() {
  const sharp = await loadSharp();
  if (!sharp || !fs.existsSync(BG)) {
    console.log('Need sharp + background.png locally.');
    console.log('Fallback anchors (original-game approximate, 800×600):');
    console.log('  scroll center: (520, 300)');
    console.log('  profile column: x=430, y=175, slotHeight=56, width=280');
    console.log('  enterName banner: x=520, y=130');
    process.exit(0);
  }

  const { data, info } = await sharp(BG).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isParchment(data, i)) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
        count += 1;
      }
    }
  }

  const scroll = {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
    centerX: Math.round((minX + maxX) / 2),
    centerY: Math.round((minY + maxY) / 2),
  };

  // Name text sits right of rank icons — scan dark text columns inside scroll right half
  const textColX = Math.round(minX + scroll.width * 0.42);
  const firstSlotY = Math.round(minY + scroll.height * 0.22);

  console.log('AUTH BACKGROUND ANALYSIS (800×600)\n');
  console.log('Parchment scroll bbox:', scroll);
  console.log(`Suggested profile column: x=${textColX}, y=${firstSlotY}, slotHeight=56`);
  console.log(`Enter-name banner: x=${scroll.centerX}, y=${minY + 45}`);
  console.log(`Icon column (left of names): x=${textColX - 55}, y=${firstSlotY}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});