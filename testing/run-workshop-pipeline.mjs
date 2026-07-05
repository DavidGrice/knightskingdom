/**
 * Workshop GUI test pipeline — unit (no server) + layout + visual baselines.
 *
 * Usage:
 *   node testing/run-workshop-pipeline.mjs
 *   node testing/run-workshop-pipeline.mjs --unit-only
 *   node testing/run-workshop-pipeline.mjs --layout-only
 *   node testing/run-workshop-pipeline.mjs --visual-only
 *
 * Requires dev server: npm run dev
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { assertDevServerReady } from './lib/driver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const UNIT_SUITES = [
  'testing/workshop/unit/workshop-metrics.test.mjs',
  'testing/workshop/unit/workshop-css-vars.test.mjs',
  'testing/workshop/unit/workshop-challenges.test.mjs',
];

const SMOKE_SUITES = [
  'testing/workshop/smoke/workshop-routes.smoke.test.mjs',
  'testing/workshop/smoke/workshop-challenges.smoke.test.mjs',
];

const LAYOUT_SUITES = [
  'testing/workshop/layout/workshop-default.layout.test.mjs',
  'testing/workshop/layout/workshop-bucket.layout.test.mjs',
  'testing/workshop/layout/workshop-palette.layout.test.mjs',
];

const VISUAL_SUITES = [
  'testing/workshop/visual/workshop-baselines.visual.test.mjs',
];

const args = process.argv.slice(2);
const unitOnly = args.includes('--unit-only');
const layoutOnly = args.includes('--layout-only');
const visualOnly = args.includes('--visual-only');
const smokeOnly = args.includes('--smoke-only');

let selected = [...UNIT_SUITES, ...LAYOUT_SUITES, ...SMOKE_SUITES, ...VISUAL_SUITES];
if (unitOnly) {
  selected = UNIT_SUITES;
} else if (layoutOnly) {
  selected = LAYOUT_SUITES;
} else if (smokeOnly) {
  selected = SMOKE_SUITES;
} else if (visualOnly) {
  selected = VISUAL_SUITES;
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
  if (!unitOnly) {
    await assertDevServerReady();
  }

  const phase = unitOnly
    ? 'unit'
    : layoutOnly
      ? 'layout'
      : smokeOnly
        ? 'smoke'
        : visualOnly
          ? 'visual'
          : 'unit + layout + smoke + visual';

  console.log(`Workshop GUI pipeline (${phase}) — ${selected.length} suite(s)`);
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
  console.log('\nAll workshop GUI suites passed');
};

main();