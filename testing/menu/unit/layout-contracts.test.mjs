/**
 * Unit tests — layout contract builders (no browser).
 * Run: node testing/menu/unit/layout-contracts.test.mjs
 */
import { runUnitSuite, assert, assertEqual, assertNear } from '../../lib/unitRunner.mjs';
import { buildAuthLayoutContract } from '../../../src/Components/Common/MenuStageLayout/authLayoutContract.js';
import { buildStartLayoutContract, START_WORLD_LAYOUT_SCALE } from '../../../src/Components/Common/MenuStageLayout/startLayoutMath.js';
import {
  buildSingleHeaderLayoutContract,
  SINGLE_HEADER_LAYOUT_SCALE,
  SINGLE_HEADER_HOLDER_CENTER,
} from '../../../src/Components/Common/MenuStageLayout/singleHeaderLayoutMath.js';
import { buildOptionsLayoutContract } from '../../../src/Components/Common/MenuStageLayout/optionsLayoutMath.js';
import { buildCreditsLayoutContract } from '../../../src/Components/Common/MenuStageLayout/creditsLayoutMath.js';
import { MENU_SCREEN_METRICS } from '../../../src/Components/Common/MenuStageLayout/menuStageMetrics.js';
import {
  SCALE_MATRIX_SCREENS,
  SCALE_MATRIX_VIEWPORTS,
} from '../../lib/menuScaleMatrix.mjs';

const MY_MODELS_CONTRACT = buildSingleHeaderLayoutContract('MY_MODELS', 'MY_MODELS');
const SNAPSHOT_CONTRACT = buildSingleHeaderLayoutContract('SNAPSHOT', 'SNAPSHOT');
const START_CONTRACT = buildStartLayoutContract();
const AUTH_CONTRACT = buildAuthLayoutContract();

await runUnitSuite('menu.unit.layout-contracts', [
  {
    name: 'all MENU_SCREEN_METRICS entries have screenKey archetype',
    fn: () => {
      for (const [key, screen] of Object.entries(MENU_SCREEN_METRICS)) {
        assert(screen.archetype, `${key} missing archetype`);
        assert(screen.corners, `${key} missing corners config`);
      }
    },
  },
  {
    name: 'single-header scale matches world picker',
    fn: () => {
      assertEqual(SINGLE_HEADER_LAYOUT_SCALE, START_WORLD_LAYOUT_SCALE, 'layout scale');
      assertEqual(SINGLE_HEADER_LAYOUT_SCALE, 0.72, 'expected 0.72');
    },
  },
  {
    name: 'single-header holder center matches start world',
    fn: () => {
      assertEqual(SINGLE_HEADER_HOLDER_CENTER.x, START_CONTRACT.holderCenter.x, 'center x');
      assertEqual(SINGLE_HEADER_HOLDER_CENTER.y, START_CONTRACT.holderCenter.y, 'center y');
    },
  },
  {
    name: 'MY_MODELS scaled panel dimensions',
    fn: () => {
      assertEqual(MY_MODELS_CONTRACT.scaledPanel.width, Math.round(519 * 0.72));
      assertEqual(MY_MODELS_CONTRACT.scaledPanel.height, Math.round(587 * 0.72));
    },
  },
  {
    name: 'SNAPSHOT scaled panel dimensions (541px native holder)',
    fn: () => {
      assertEqual(SNAPSHOT_CONTRACT.scaledPanel.width, Math.round(516 * 0.72));
      assertEqual(SNAPSHOT_CONTRACT.scaledPanel.height, Math.round(541 * 0.72));
    },
  },
  {
    name: 'START_WORLD scaled panel dimensions',
    fn: () => {
      assertEqual(START_CONTRACT.scaledPanel.width, Math.round(519 * 0.72));
      assertEqual(START_CONTRACT.scaledPanel.totalHeight, Math.round((57 + 530) * 0.72));
    },
  },
  {
    name: 'auth contract has profile list and name field',
    fn: () => {
      assert(AUTH_CONTRACT.profileList.rowWidth > 0, 'row width');
      assert(AUTH_CONTRACT.nameField.maxLength >= 4, 'max length');
      assertEqual(AUTH_CONTRACT.screenKey, 'AUTHENTICATION');
    },
  },
  {
    name: 'OPTIONS contract exposes help bin and corner anchor',
    fn: () => {
      const c = buildOptionsLayoutContract();
      assertEqual(c.corner.x, 662);
      assert(c.bin.width > 0 && c.bin.height > 0, 'help bin size');
      assertEqual(MENU_SCREEN_METRICS.OPTIONS.optionStack.rowCount, 4);
    },
  },
  {
    name: 'CREDITS scroll panel computed rect',
    fn: () => {
      const c = buildCreditsLayoutContract();
      assertEqual(c.scrollPanel.left, 108);
      assertEqual(c.scrollPanel.top, 99);
      assertEqual(c.scrollPanel.width, 232);
      assertEqual(c.scrollPanel.height, 310);
    },
  },
  {
    name: 'MAIN_MENU button stack metrics',
    fn: () => {
      const m = MENU_SCREEN_METRICS.MAIN_MENU.buttonStack;
      assertEqual(m.centerX, 400);
      assertEqual(m.gap, 8);
    },
  },
  {
    name: 'scale matrix covers every MENU_SCREEN_METRICS screenKey',
    fn: () => {
      const metricKeys = Object.keys(MENU_SCREEN_METRICS);
      for (const { screenKey } of SCALE_MATRIX_SCREENS) {
        assert(metricKeys.includes(screenKey), `missing metrics for ${screenKey}`);
      }
      assertEqual(SCALE_MATRIX_SCREENS.length, metricKeys.length, 'screen count');
      assertEqual(SCALE_MATRIX_VIEWPORTS.length, 3);
    },
  },
  {
    name: 'MENU_SCREEN_METRICS MY_MODELS and SNAPSHOT reference single-header layout',
    fn: () => {
      assert(MENU_SCREEN_METRICS.MY_MODELS.singleHeaderLayout, 'MY_MODELS layout');
      assert(MENU_SCREEN_METRICS.SNAPSHOT.singleHeaderLayout, 'SNAPSHOT layout');
      assertNear(
        MENU_SCREEN_METRICS.SNAPSHOT.singleHeaderLayout.scaledPanel.height,
        Math.round(541 * 0.72),
        0,
        'SNAPSHOT scaled height',
      );
    },
  },
]);