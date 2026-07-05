/**
 * Pixel anchors on the 800×600 menu canvas (all non-3D bitmap screens).
 * Holder grid cell geometry is shared with HolderGridLayout (109×80, 3×3).
 *
 * Panel archetypes:
 *   SINGLE_HEADER — one holder frame (SnapShot, MyModels)
 *   DUAL_HEADER   — tab strip + holder (World picker: Local / Shared)
 *
 * Measure / refresh: node grok/analyze-menu-images.mjs
 */

import { HOLDER_VARIANTS } from '../HolderGridLayout/holderGridMetrics.js';

export const MENU_CANVAS = { width: 800, height: 600 };

/** Shared corner controls (measured from background art, 800×600) */
export const MENU_CORNERS = {
  checkmark: { x: 120, y: 560, width: 169, height: 123 },
  trash: { x: 631, y: 560, width: 169, height: 123 },
  leave: { x: 696, y: 0, width: 80, height: 87 },
};

/** @typedef {'SINGLE_HEADER' | 'DUAL_HEADER' | 'PROFILE_LIST'} PanelArchetype */

/**
 * Per-screen layout on the 800×600 stage.
 * holderCenter — center of the dropdown / snapshot holder on the stage.
 */
export const MENU_SCREEN_METRICS = {
  AUTHENTICATION: {
    archetype: 'PROFILE_LIST',
    /** Full rank row sprites (page_2.png etc.) are 528×99 */
    profileList: { x: 262, y: 118, rowWidth: 528, rowHeight: 99 },
    nameOverlay: { left: 200, width: 280 },
    enterNameBanner: { x: 526, y: 82 },
    corners: { checkmark: true, trash: true, leave: false },
  },
  START_WORLD: {
    archetype: 'DUAL_HEADER',
    holderCenter: { x: 400, y: 310 },
    header: { width: 519, height: 57, tabWidth: 141, tabGap: 8 },
    holderVariant: 'WORLD_LIGHT',
    corners: { checkmark: true, trash: false, leave: true },
  },
  MY_MODELS: {
    archetype: 'SINGLE_HEADER',
    holderCenter: { x: 388, y: 305 },
    holderVariant: 'MY_MODELS',
    corners: { checkmark: true, trash: false, leave: false },
  },
  SNAPSHOT: {
    archetype: 'SINGLE_HEADER',
    holderCenter: { x: 400, y: 295 },
    holderVariant: 'SNAPSHOT',
    corners: { checkmark: true, trash: false, leave: false },
  },
};

export const PANEL_ARCHETYPES = {
  SINGLE_HEADER: {
    description: 'One holder frame — save game & photo album',
    holderVariants: ['MY_MODELS', 'SNAPSHOT'],
    hasTabStrip: false,
  },
  DUAL_HEADER: {
    description: 'Local / Shared tab strip above holder — world picker',
    holderVariants: ['WORLD_LIGHT', 'WORLD_DARK'],
    hasTabStrip: true,
    tabSprites: {
      local: { idle: 'local_worlds_2', active: 'local_worlds_4' },
      shared: { idle: 'shared_worlds_2', active: 'shared_worlds_4' },
    },
  },
  PROFILE_LIST: {
    description: 'Vertical profile slots on parchment — authentication',
    hasTabStrip: false,
  },
};

/** Resolve holder variant metrics for a screen key */
export const getHolderMetricsForScreen = (screenKey) => {
  const screen = MENU_SCREEN_METRICS[screenKey];
  if (!screen?.holderVariant) {
    return null;
  }
  return HOLDER_VARIANTS[screen.holderVariant];
};

/** CSS custom properties for a menu stage wrapper */
export const menuStageToCssVars = (screenKey) => {
  const screen = MENU_SCREEN_METRICS[screenKey];
  const vars = {
    '--msl-canvas-w': `${MENU_CANVAS.width}px`,
    '--msl-canvas-h': `${MENU_CANVAS.height}px`,
    '--msl-check-x': `${MENU_CORNERS.checkmark.x}px`,
    '--msl-check-y': `${MENU_CORNERS.checkmark.y}px`,
    '--msl-trash-x': `${MENU_CORNERS.trash.x}px`,
    '--msl-trash-y': `${MENU_CORNERS.trash.y}px`,
    '--msl-leave-x': `${MENU_CORNERS.leave.x}px`,
    '--msl-leave-y': `${MENU_CORNERS.leave.y}px`,
  };

  if (screen?.holderCenter) {
    vars['--msl-holder-cx'] = `${screen.holderCenter.x}px`;
    vars['--msl-holder-cy'] = `${screen.holderCenter.y}px`;
  }

  if (screen?.profileList) {
    const { x, y, rowWidth, rowHeight } = screen.profileList;
    vars['--auth-list-x'] = `${x}px`;
    vars['--auth-list-y'] = `${y}px`;
    vars['--auth-row-w'] = `${rowWidth}px`;
    vars['--auth-row-h'] = `${rowHeight}px`;
  }
  if (screen?.nameOverlay) {
    vars['--auth-name-left'] = `${screen.nameOverlay.left}px`;
    vars['--auth-name-w'] = `${screen.nameOverlay.width}px`;
  }
  if (screen?.enterNameBanner) {
    vars['--auth-banner-x'] = `${screen.enterNameBanner.x}px`;
    vars['--auth-banner-y'] = `${screen.enterNameBanner.y}px`;
  }

  return vars;
};

/** @param {{ x: number, y: number, width: number, height: number }} rect */
export const rectToStyle = ({ x, y, width, height }) => ({
  left: `${x}px`,
  top: `${y}px`,
  width: `${width}px`,
  height: `${height}px`,
});