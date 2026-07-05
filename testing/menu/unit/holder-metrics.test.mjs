/**
 * Unit tests — holderGridMetrics anchors and frozen tuned values.
 * Run: node testing/menu/unit/holder-metrics.test.mjs
 */
import { runUnitSuite, assert, assertEqual } from '../../lib/unitRunner.mjs';
import { HOLDER_VARIANTS } from '../../../src/Components/Common/HolderGridLayout/holderGridMetrics.js';

const CELL_W = 109;
const CELL_H = 80;
const GRID_GAP_X = 23;
const GRID_GAP_Y = 28;

/** @param {import('../../../src/Components/Common/HolderGridLayout/holderGridMetrics.js').HolderVariant} v */
const assertAnchorInBody = (name, v, point, label) => {
  assert(point.x >= 0 && point.x <= v.bodyWidth, `${name} ${label}.x out of body`);
  assert(point.y >= 0 && point.y <= v.bodyHeight, `${name} ${label}.y out of body`);
};

/** @param {import('../../../src/Components/Common/HolderGridLayout/holderGridMetrics.js').HolderVariant} v */
const assertFooterInBody = (name, v) => {
  const f = v.footer;
  assert(f.left >= 0, `${name} footer.left`);
  assert(f.left + f.width <= v.bodyWidth + 2, `${name} footer exceeds body width`);
  if ('top' in f) {
    assert(f.top + f.height <= v.bodyHeight + 2, `${name} footer exceeds body height (top)`);
  }
  if ('bottom' in f) {
    assert(f.bottom + f.height <= v.bodyHeight + 2, `${name} footer exceeds body height (bottom)`);
  }
};

await runUnitSuite('menu.unit.holder-metrics', [
  {
    name: 'shared cell geometry across grid variants',
    fn: () => {
      for (const key of ['WORLD_LIGHT', 'WORLD_DARK', 'SNAPSHOT', 'MY_MODELS']) {
        const v = HOLDER_VARIANTS[key];
        assertEqual(v.width, CELL_W, `${key} cell width`);
        assertEqual(v.height, CELL_H, `${key} cell height`);
        assertEqual(v.x, GRID_GAP_X, `${key} gap x`);
        assertEqual(v.y, GRID_GAP_Y, `${key} gap y`);
      }
    },
  },
  {
    name: 'SNAPSHOT native holder matches asset (516×541)',
    fn: () => {
      const v = HOLDER_VARIANTS.SNAPSHOT;
      assertEqual(v.bodyWidth, 516);
      assertEqual(v.bodyHeight, 541);
    },
  },
  {
    name: 'frozen SnapShot Richard position',
    fn: () => {
      const { help } = HOLDER_VARIANTS.SNAPSHOT;
      assertEqual(help.x, 445);
      assertEqual(help.y, 418);
      assertAnchorInBody('SNAPSHOT', HOLDER_VARIANTS.SNAPSHOT, help, 'help');
    },
  },
  {
    name: 'frozen SnapShot footer oval tray',
    fn: () => {
      const { footer } = HOLDER_VARIANTS.SNAPSHOT;
      assertEqual(footer.left, 53);
      assertEqual(footer.top, 436);
      assertEqual(footer.width, 300);
      assertEqual(footer.height, 58);
      assertEqual(footer.gap, 10);
      assertFooterInBody('SNAPSHOT', HOLDER_VARIANTS.SNAPSHOT);
    },
  },
  {
    name: 'frozen Shared Worlds footer oval (WORLD_DARK)',
    fn: () => {
      const { footer } = HOLDER_VARIANTS.WORLD_DARK;
      assertEqual(footer.left, 62);
      assertEqual(footer.bottom, 35);
      assertEqual(footer.width, 285);
      assertEqual(footer.height, 71);
      assertEqual(footer.gap, 8);
      assertFooterInBody('WORLD_DARK', HOLDER_VARIANTS.WORLD_DARK);
    },
  },
  {
    name: 'MY_MODELS help and footer anchors in body',
    fn: () => {
      const v = HOLDER_VARIANTS.MY_MODELS;
      assertAnchorInBody('MY_MODELS', v, v.help, 'help');
      assertFooterInBody('MY_MODELS', v);
    },
  },
  {
    name: '3×3 grid fits inside each holder body',
    fn: () => {
      for (const key of ['WORLD_LIGHT', 'WORLD_DARK', 'SNAPSHOT', 'MY_MODELS']) {
        const v = HOLDER_VARIANTS[key];
        const gridW = 3 * CELL_W + 2 * GRID_GAP_X;
        const gridH = 3 * CELL_H + 2 * GRID_GAP_Y;
        assert(v.gridLeft + gridW <= v.bodyWidth + 4, `${key} grid width overflow`);
        assert(v.gridTop + gridH <= v.bodyHeight + 4, `${key} grid height overflow`);
      }
    },
  },
]);