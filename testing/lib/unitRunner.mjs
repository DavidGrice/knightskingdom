/**
 * Minimal test runner for Node unit suites (no external test framework).
 */

export class AssertError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AssertError';
  }
}

export const assert = (condition, message) => {
  if (!condition) {
    throw new AssertError(message);
  }
};

export const assertEqual = (actual, expected, label = 'value') => {
  if (actual !== expected) {
    throw new AssertError(`${label}: expected ${expected}, got ${actual}`);
  }
};

export const assertNear = (actual, expected, tolerance, label = 'value') => {
  if (Math.abs(actual - expected) > tolerance) {
    throw new AssertError(
      `${label}: expected ~${expected} (±${tolerance}), got ${actual}`,
    );
  }
};

/** @param {Array<{ name: string, fn: () => void | Promise<void> }>} cases */
export const runUnitSuite = async (suiteName, cases) => {
  let passed = 0;
  const failures = [];

  for (const { name, fn } of cases) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await fn();
      passed += 1;
    } catch (e) {
      failures.push({ name, error: e.message || String(e) });
    }
  }

  if (failures.length > 0) {
    console.error(`FAIL ${suiteName}`);
    for (const f of failures) {
      console.error(`  ✗ ${f.name}: ${f.error}`);
    }
    process.exit(1);
  }

  console.log(`PASS ${suiteName} (${passed} cases)`);
};