/**
 * Orchestrates the full regression suite.
 *
 * Usage:
 *   node testing/run-regression.mjs              # all suites
 *   node testing/run-regression.mjs --menu-only    # styling/layout only
 *   node testing/run-regression.mjs --engine-only  # 3D world tests only
 *   TEST_CAPTURE=1 node testing/run-regression.mjs # save screenshots to testing/output/
 *
 * Requires dev server: npm run dev (TEST_BASE_URL to override)
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const SUITES = {
  menu: [
    'testing/menu-auth.layout.test.mjs',
    'testing/menu-auth.scale-matrix.test.mjs',
    'testing/menu-start.layout.test.mjs',
    'testing/menu-mymodels.layout.test.mjs',
    'testing/menu-snapshot.layout.test.mjs',
  ],
  engine: [
    'testing/world-load.test.mjs',
    'testing/placements.test.mjs',
  ],
  extraction: [
    'testing/extraction_fixtures_test.py',
  ],
};

const args = process.argv.slice(2);
const menuOnly = args.includes('--menu-only');
const engineOnly = args.includes('--engine-only');

let selected = [...SUITES.menu, ...SUITES.engine];
if (menuOnly) {
  selected = SUITES.menu;
} else if (engineOnly) {
  selected = SUITES.engine;
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
  console.log(`Regression suite — ${selected.length} test(s)`);
  console.log(`Base URL: ${process.env.TEST_BASE_URL || 'http://localhost:3000'}\n`);

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
  console.log('\nAll suites passed');
};

main();