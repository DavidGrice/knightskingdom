/**
 * Pixel analysis for menu UI assets (auth, start, save, photo).
 * Run: node grok/analyze-menu-images.mjs
 * Optional: npm install sharp (dev) for live PNG scans
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Node cannot resolve @/ aliases — load metrics via createRequire (.js extension required)
const { MENU_CANVAS, MENU_CORNERS, MENU_SCREEN_METRICS, PANEL_ARCHETYPES } = require(
  '../src/Components/Common/MenuStageLayout/menuStageMetrics.js',
);
const { HOLDER_VARIANTS } = require(
  '../src/Components/Common/HolderGridLayout/holderGridMetrics.js',
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const MENU_ASSETS = {
  authBackground: 'src/Components/AuthenticationStack/AuthStackResources/background.png',
  startBackground: 'src/Components/MainMenuStack/StartStack/Start/StartResourceStack/background.png',
  myModelsBackground: 'src/Components/MainMenuStack/StartStack/MainGameStack/MyModels/MyModelsResourceStack/background.png',
  snapshotBackground: 'src/Components/MainMenuStack/StartStack/MainGameStack/SnapShot/SnapShotResourceStack/background.png',
  worldLightBody: 'src/Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/light_drop_down.png',
  worldDarkBody: 'src/Components/MainMenuStack/StartStack/World/WorldBody/WorldBodyResourceStack/dark_drop_down.png',
  myModelsHolder: 'src/Components/MainMenuStack/StartStack/MainGameStack/MyModels/MyModelsResourceStack/drop_down.png',
  snapshotHolder: 'src/Components/MainMenuStack/StartStack/MainGameStack/SnapShot/SnapShotHolder/SnapShotHolderResourceStack/snapshot_holder.png',
};

async function tryLoadSharp() {
  try {
    const mod = await import('sharp');
    return mod.default;
  } catch {
    return null;
  }
}

async function probeDimensions(sharp, filePath) {
  const full = path.join(ROOT, filePath);
  if (!fs.existsSync(full)) {
    return { path: filePath, missing: true };
  }
  if (!sharp) {
    const stat = fs.statSync(full);
    return { path: filePath, bytes: stat.size, sharp: false };
  }
  const meta = await sharp(full).metadata();
  return { path: filePath, width: meta.width, height: meta.height };
}

function printSection(title) {
  console.log(`\n## ${title}\n`);
}

async function main() {
  const sharp = await tryLoadSharp();
  console.log('MENU IMAGE ANALYSIS REPORT');
  console.log('==========================');
  console.log(`Canvas: ${MENU_CANVAS.width}×${MENU_CANVAS.height}`);
  if (!sharp) {
    console.log('\n(sharp not installed — file presence + coded metrics only)');
    console.log('  npm install sharp --save-dev  for live dimension probes');
  }

  printSection('Asset inventory');
  for (const [key, rel] of Object.entries(MENU_ASSETS)) {
    const info = await probeDimensions(sharp, rel);
    if (info.missing) {
      console.log(`  ${key.padEnd(20)} MISSING  ${rel}`);
    } else if (info.width) {
      console.log(`  ${key.padEnd(20)} ${info.width}×${info.height}  ${rel}`);
    } else {
      console.log(`  ${key.padEnd(20)} ${info.bytes} bytes  ${rel}`);
    }
  }

  printSection('Panel archetypes');
  for (const [key, archetype] of Object.entries(PANEL_ARCHETYPES)) {
    console.log(`  ${key}: ${archetype.description}`);
    if (archetype.holderVariants) {
      console.log(`    holder variants: ${archetype.holderVariants.join(', ')}`);
    }
  }

  printSection('Screen metrics (menuStageMetrics.js)');
  for (const [key, screen] of Object.entries(MENU_SCREEN_METRICS)) {
    console.log(`  ${key}:`);
    console.log(`    archetype: ${screen.archetype}`);
    if (screen.holderCenter) {
      console.log(`    holder center: (${screen.holderCenter.x}, ${screen.holderCenter.y})`);
    }
    if (screen.holderVariant) {
      const h = HOLDER_VARIANTS[screen.holderVariant];
      console.log(`    holder body: ${h.bodyWidth}×${h.bodyHeight}, grid @ (${h.gridLeft}, ${h.gridTop})`);
    }
    if (screen.profileColumn) {
      console.log(`    profile column: x=${screen.profileColumn.x}, slots=${screen.profileColumn.slotHeight}px`);
    }
  }

  printSection('Shared corners');
  console.log(`  checkmark: (${MENU_CORNERS.checkmark.x}, ${MENU_CORNERS.checkmark.y})`);
  console.log(`  trash:     (${MENU_CORNERS.trash.x}, ${MENU_CORNERS.trash.y})`);
  console.log(`  leave:     (${MENU_CORNERS.leave.x}, ${MENU_CORNERS.leave.y})`);

  printSection('Standardization notes');
  console.log('  SINGLE_HEADER screens share: 3×3 PaginatedGrid + HolderGridLayout cell geometry (109×80)');
  console.log('  DUAL_HEADER adds tab strip (141×57 × 2) above WORLD_LIGHT / WORLD_DARK holder bodies');
  console.log('  All screens should mount inside MenuStageLayout (800×600 scale var --msl-scale)');
  console.log('  Grid menus should use MenuPanelShell with matching archetype prop');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});