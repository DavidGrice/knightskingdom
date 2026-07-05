/**
 * Unit tests — frozen WORKSHOP_STAGE_METRICS (no browser).
 */
import { runUnitSuite, assertEqual } from '../../lib/unitRunner.mjs';
import {
  WORKSHOP_CANVAS,
  WORKSHOP_STAGE_METRICS,
} from '../../../src/Components/Common/WorkshopStageLayout/workshopStageMetrics.js';
import { HOLDER_VARIANTS } from '../../../src/Components/Common/HolderGridLayout/holderGridMetrics.js';

await runUnitSuite('workshop.unit.metrics', [
  {
    name: 'canvas is 800×600',
    fn: () => {
      assertEqual(WORKSHOP_CANVAS.width, 800);
      assertEqual(WORKSHOP_CANVAS.height, 600);
    },
  },
  {
    name: 'toolbar bar heights',
    fn: () => {
      assertEqual(WORKSHOP_STAGE_METRICS.topBar.height, 103);
      assertEqual(WORKSHOP_STAGE_METRICS.bottomBar.height, 126);
    },
  },
  {
    name: 'bucket panel anchor (drop_down.png)',
    fn: () => {
      const { bucketPanel } = WORKSHOP_STAGE_METRICS;
      assertEqual(bucketPanel.x, 0);
      assertEqual(bucketPanel.y, 77);
      assertEqual(bucketPanel.width, 238);
      assertEqual(bucketPanel.height, 556);
    },
  },
  {
    name: 'palette panel anchor (color_mixer_board)',
    fn: () => {
      const { palettePanel } = WORKSHOP_STAGE_METRICS;
      assertEqual(palettePanel.x, 370);
      assertEqual(palettePanel.y, 60);
      assertEqual(palettePanel.width, 196);
      assertEqual(palettePanel.height, 196);
    },
  },
  {
    name: 'toolbar bucket/save slots',
    fn: () => {
      const { bucketButton, saveButton, saveGap } = WORKSHOP_STAGE_METRICS.toolbar;
      assertEqual(bucketButton.x, 195);
      assertEqual(bucketButton.y, 5);
      assertEqual(bucketButton.width, 45);
      assertEqual(bucketButton.height, 63);
      assertEqual(saveButton.x, 248);
      assertEqual(saveButton.y, 13);
      assertEqual(saveGap, 8);
    },
  },
  {
    name: 'WORKSHOP_BUCKET grid variant body size',
    fn: () => {
      const v = HOLDER_VARIANTS.WORKSHOP_BUCKET;
      assertEqual(v.bodyWidth, 238);
      assertEqual(v.bodyHeight, 556);
      assertEqual(v.gridColumns, 2);
      assertEqual(v.gridRows, 3);
    },
  },
]);