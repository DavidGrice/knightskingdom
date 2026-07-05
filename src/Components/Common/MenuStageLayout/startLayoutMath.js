/**
 * Start / world picker layout on background.png (800×600).
 * Holder assets are native 519×530 + 57px tabs; scale down for on-screen fit.
 * Internal grid ratios stay native — apply START_WORLD_LAYOUT_SCALE uniformly.
 */

import { HOLDER_VARIANTS } from '../HolderGridLayout/holderGridMetrics.js';

/** Native dual-header + holder stack height (57 + 530) */
export const START_WORLD_PANEL_NATIVE = {
  headerWidth: 519,
  headerHeight: 57,
  bodyWidth: HOLDER_VARIANTS.WORLD_LIGHT.bodyWidth,
  bodyHeight: HOLDER_VARIANTS.WORLD_LIGHT.bodyHeight,
};

/** Panel center on start background (800×600 canvas px) */
export const START_WORLD_HOLDER_CENTER = { x: 400, y: 310 };

/**
 * Display scaler for world picker shell (tabs + grid + overlays).
 * 1 = native asset pixels on canvas.
 */
export const START_WORLD_LAYOUT_SCALE = 0.72;

export const buildStartLayoutContract = (
  layoutScale = START_WORLD_LAYOUT_SCALE,
) => ({
  version: 1,
  screenKey: 'START_WORLD',
  layoutScale,
  holderCenter: { ...START_WORLD_HOLDER_CENTER },
  panelNative: { ...START_WORLD_PANEL_NATIVE },
  scaledPanel: {
    width: Math.round(START_WORLD_PANEL_NATIVE.headerWidth * layoutScale),
    totalHeight: Math.round(
      (START_WORLD_PANEL_NATIVE.headerHeight + START_WORLD_PANEL_NATIVE.bodyHeight) * layoutScale,
    ),
  },
});

export const startLayoutToCssVars = (contract = buildStartLayoutContract()) => ({
  '--start-world-layout-scale': String(contract.layoutScale),
  '--msl-holder-cx': `${contract.holderCenter.x}px`,
  '--msl-holder-cy': `${contract.holderCenter.y}px`,
});