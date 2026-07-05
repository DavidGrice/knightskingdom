/**
 * Unit tests — workshopStageToCssVars outputs.
 */
import { runUnitSuite, assertEqual } from '../../lib/unitRunner.mjs';
import {
  workshopStageToCssVars,
  WORKSHOP_STAGE_METRICS,
} from '../../../src/Components/Common/WorkshopStageLayout/workshopStageMetrics.js';

const vars = workshopStageToCssVars();
const { toolbar, bucketPanel, palettePanel, canvas } = WORKSHOP_STAGE_METRICS;

const saveRight = toolbar.bucketButton.x
  + toolbar.bucketButton.width
  + toolbar.saveGap
  + toolbar.saveButton.width;
const expectedMiddleGap = toolbar.middleTools.x - saveRight;

await runUnitSuite('workshop.unit.css-vars', [
  {
    name: 'canvas dimensions',
    fn: () => {
      assertEqual(vars['--wsl-canvas-w'], '800px');
      assertEqual(vars['--wsl-canvas-h'], '600px');
    },
  },
  {
    name: 'bucket CSS vars',
    fn: () => {
      assertEqual(vars['--wsl-bucket-x'], `${bucketPanel.x}px`);
      assertEqual(vars['--wsl-bucket-y'], `${bucketPanel.y}px`);
      assertEqual(vars['--wsl-bucket-w'], `${bucketPanel.width}px`);
      assertEqual(vars['--wsl-bucket-h'], `${bucketPanel.height}px`);
    },
  },
  {
    name: 'palette CSS vars',
    fn: () => {
      assertEqual(vars['--wsl-palette-x'], `${palettePanel.x}px`);
      assertEqual(vars['--wsl-palette-y'], `${palettePanel.y}px`);
      assertEqual(vars['--wsl-palette-w'], `${palettePanel.width}px`);
      assertEqual(vars['--wsl-palette-h'], `${palettePanel.height}px`);
    },
  },
  {
    name: 'toolbar middle gap derived from save row',
    fn: () => {
      assertEqual(expectedMiddleGap, 62);
      assertEqual(vars['--wsl-toolbar-middle-gap'], '62px');
    },
  },
  {
    name: 'bar heights exported',
    fn: () => {
      assertEqual(vars['--wsl-top-bar-h'], '103px');
      assertEqual(vars['--wsl-bottom-bar-h'], '126px');
    },
  },
]);