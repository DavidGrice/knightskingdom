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
import { MENU_SCREEN_METRICS } from '../../../src/Components/Common/MenuStageLayout/menuStageMetrics.js';

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