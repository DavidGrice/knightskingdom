/**
 * Unit tests — menuStageToCssVars per screenKey.
 * Run: node testing/menu/unit/css-vars.test.mjs
 */
import { runUnitSuite, assert, assertEqual } from '../../lib/unitRunner.mjs';
import { menuStageToCssVars, MENU_SCREEN_METRICS } from '../../../src/Components/Common/MenuStageLayout/menuStageMetrics.js';
import { START_WORLD_HOLDER_CENTER } from '../../../src/Components/Common/MenuStageLayout/startLayoutMath.js';

const SCREEN_KEYS = [
  'MAIN_MENU',
  'OPTIONS',
  'CREDITS',
  'AUTHENTICATION',
  'START_WORLD',
  'MY_MODELS',
  'SNAPSHOT',
];

await runUnitSuite('menu.unit.css-vars', [
  {
    name: 'every screen sets canvas dimensions',
    fn: () => {
      for (const key of SCREEN_KEYS) {
        const vars = menuStageToCssVars(key);
        assertEqual(vars['--msl-canvas-w'], '800px', `${key} canvas w`);
        assertEqual(vars['--msl-canvas-h'], '600px', `${key} canvas h`);
      }
    },
  },
  {
    name: 'START_WORLD sets world layout scale and holder center',
    fn: () => {
      const vars = menuStageToCssVars('START_WORLD');
      assertEqual(vars['--start-world-layout-scale'], '0.72');
      assertEqual(vars['--msl-holder-cx'], `${START_WORLD_HOLDER_CENTER.x}px`);
      assertEqual(vars['--msl-holder-cy'], `${START_WORLD_HOLDER_CENTER.y}px`);
      assert(vars['--msl-check-x'], 'checkmark x');
    },
  },
  {
    name: 'MY_MODELS sets single-header scale and holder center',
    fn: () => {
      const vars = menuStageToCssVars('MY_MODELS');
      assertEqual(vars['--single-header-layout-scale'], '0.72');
      assertEqual(vars['--msl-holder-cx'], `${START_WORLD_HOLDER_CENTER.x}px`);
      assertEqual(vars['--msl-holder-cy'], `${START_WORLD_HOLDER_CENTER.y}px`);
    },
  },
  {
    name: 'SNAPSHOT sets single-header scale',
    fn: () => {
      const vars = menuStageToCssVars('SNAPSHOT');
      assertEqual(vars['--single-header-layout-scale'], '0.72');
      assert(vars['--msl-check-x'], 'checkmark');
    },
  },
  {
    name: 'AUTHENTICATION sets trash corner vars',
    fn: () => {
      const vars = menuStageToCssVars('AUTHENTICATION');
      assert(vars['--msl-trash-x'], 'trash x');
      assert(vars['--auth-list-x'], 'profile list');
    },
  },
  {
    name: 'OPTIONS sets option stack gap',
    fn: () => {
      const vars = menuStageToCssVars('OPTIONS');
      assert(vars['--options-stack-gap'], 'stack gap');
      assert(vars['--options-stack-pt'], 'stack padding top');
    },
  },
  {
    name: 'CREDITS sets checkmark corner',
    fn: () => {
      const vars = menuStageToCssVars('CREDITS');
      assert(vars['--msl-check-bottom'], 'check bottom');
    },
  },
  {
    name: 'MAIN_MENU sets button stack gap',
    fn: () => {
      const vars = menuStageToCssVars('MAIN_MENU');
      assertEqual(
        vars['--main-menu-btn-gap'],
        `${MENU_SCREEN_METRICS.MAIN_MENU.buttonStack.gap}px`,
      );
    },
  },
]);