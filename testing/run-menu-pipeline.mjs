/**
 * GUI / menu test pipeline — unit tests (no server) + layout contracts (needs dev server).
 *
 * Usage:
 *   node testing/run-menu-pipeline.mjs              # unit + layout
 *   node testing/run-menu-pipeline.mjs --unit-only
 *   node testing/run-menu-pipeline.mjs --layout-only
 *   TEST_CAPTURE=1 node testing/run-menu-pipeline.mjs
 *
 * Requires dev server for layout phase: npm run dev
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const UNIT_SUITES = [
  'testing/menu/unit/layout-contracts.test.mjs',
  'testing/menu/unit/holder-metrics.test.mjs',
  'testing/menu/unit/css-vars.test.mjs',
];

const LAYOUT_SUITES = [
  'testing/menu/layout/menu-auth.layout.test.mjs',
  'testing/menu/layout/menu-auth.scale-matrix.test.mjs',
  'testing/menu/layout/menu-mainmenu.layout.test.mjs',
  'testing/menu/layout/menu-options.layout.test.mjs',
  'testing/menu/layout/menu-credits.layout.test.mjs',
  'testing/menu/layout/menu-start.layout.test.mjs',
  'testing/menu/layout/menu-mymodels.layout.test.mjs',
  'testing/menu/layout/menu-snapshot.layout.test.mjs',
  'testing/menu/layout/menu-scale-matrix.test.mjs',
];

const args = process.argv.slice(2);
const unitOnly = args.includes('--unit-only');
const layoutOnly = args.includes('--layout-only');

let selected = [...UNIT_SUITES, ...LAYOUT_SUITES];
if (unitOnly) {
  selected = UNIT_SUITES;
} else if (layoutOnly) {
  selected = LAYOUT_SUITES;
}

const runNode = (rel) => new Promise((resolve, reject) => {
  const full = path.join(ROOT, rel);
  const child = spawn(process.execPath, [full], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });
  child.on('close', (code) => {
    if (code === 0) {
      resolve();
    } else {
      reject(new Error(`${rel} exited ${code}`));
    }
  });
});

const main = async () => {
  const phase = unitOnly ? 'unit' : layoutOnly ? 'layout' : 'unit + layout';
  console.log(`Menu GUI pipeline (${phase}) — ${selected.length} suite(s)`);
  if (!unitOnly) {
    console.log(`Base URL: ${process.env.TEST_BASE_URL || 'http://localhost:3000'}\n`);
  } else {
    console.log('');
  }

  let failures = 0;
  for (const suite of selected) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await runNode(suite);
    } catch (e) {
      failures += 1;
      console.error(`\n✗ ${suite}: ${e.message}\n`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} suite(s) failed`);
    process.exit(1);
  }
  console.log('\nAll menu GUI suites passed');
};

main();