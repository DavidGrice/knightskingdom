/**
 * Single-header holder panels (MyModels, SnapShot) on 800×600 canvas.
 * Match world picker display size — native assets scaled uniformly.
 */

import { HOLDER_VARIANTS } from '../HolderGridLayout/holderGridMetrics.js';
import {
  START_WORLD_HOLDER_CENTER,
  START_WORLD_LAYOUT_SCALE,
} from './startLayoutMath.js';

/** Same on-screen scale as Start / world picker */
export const SINGLE_HEADER_LAYOUT_SCALE = START_WORLD_LAYOUT_SCALE;

/** Same panel anchor as world picker */
export const SINGLE_HEADER_HOLDER_CENTER = { ...START_WORLD_HOLDER_CENTER };

export const buildSingleHeaderLayoutContract = (
  screenKey,
  holderVariant,
  layoutScale = SINGLE_HEADER_LAYOUT_SCALE,
) => {
  const holder = HOLDER_VARIANTS[holderVariant];
  return {
    version: 1,
    screenKey,
    layoutScale,
    holderCenter: { ...SINGLE_HEADER_HOLDER_CENTER },
    panelNative: {
      bodyWidth: holder.bodyWidth,
      bodyHeight: holder.bodyHeight,
    },
    scaledPanel: {
      width: Math.round(holder.bodyWidth * layoutScale),
      height: Math.round(holder.bodyHeight * layoutScale),
    },
  };
};

export const singleHeaderLayoutToCssVars = (contract) => ({
  '--single-header-layout-scale': String(contract.layoutScale),
  '--msl-holder-cx': `${contract.holderCenter.x}px`,
  '--msl-holder-cy': `${contract.holderCenter.y}px`,
});