/**
 * Regenerate committed menu visual baselines.
 * Usage: npm run test:menu:baselines:update
 */
process.env.TEST_UPDATE_BASELINES = '1';
await import('./menu/visual/menu-baselines.visual.test.mjs');