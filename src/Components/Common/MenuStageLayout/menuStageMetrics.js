/**
 * Pixel anchors on the 800×600 menu canvas (all non-3D bitmap screens).
 * Holder grid cell geometry is shared with HolderGridLayout (109×80, 3×3).
 *
 * Measure / refresh: node grok/analyze-menu-images.mjs
 */

import { HOLDER_VARIANTS } from '../HolderGridLayout/holderGridMetrics.js';
import {
  buildAuthLayoutContract,
  authLayoutToCssVars,
  AUTH_CORNER_INSET,
  AUTH_CORNERS,
  AUTH_CANVAS,
} from './authLayoutContract.js';
import {
  buildCreditsLayoutContract,
  creditsLayoutToCssVars,
} from './creditsLayoutMath.js';
import {
  buildOptionsLayoutContract,
  optionsLayoutToCssVars,
} from './optionsLayoutMath.js';
import {
  buildStartLayoutContract,
  startLayoutToCssVars,
  START_WORLD_HOLDER_CENTER,
} from './startLayoutMath.js';
import {
  buildSingleHeaderLayoutContract,
  singleHeaderLayoutToCssVars,
  SINGLE_HEADER_HOLDER_CENTER,
} from './singleHeaderLayoutMath.js';

const AUTH_CONTRACT = buildAuthLayoutContract();
const CREDITS_CONTRACT = buildCreditsLayoutContract();
const OPTIONS_CONTRACT = buildOptionsLayoutContract();
const START_CONTRACT = buildStartLayoutContract();
const MY_MODELS_CONTRACT = buildSingleHeaderLayoutContract('MY_MODELS', 'MY_MODELS');
const SNAPSHOT_CONTRACT = buildSingleHeaderLayoutContract('SNAPSHOT', 'SNAPSHOT');

export const MENU_CANVAS = { width: AUTH_CANVAS.width, height: AUTH_CANVAS.height };

/** @deprecated Import AUTH_CORNER_INSET from authLayoutContract */
export const MENU_CORNER_INSET = AUTH_CORNER_INSET;

/** Shared corner controls (800×600) — bottom-anchored, trash mirrors checkmark */
export const MENU_CORNERS = {
  checkmark: { ...AUTH_CORNERS.checkmark },
  trash: { ...AUTH_CORNERS.trash },
  leave: { x: 696, y: 0 },
};

/** @typedef {'SINGLE_HEADER' | 'DUAL_HEADER' | 'PROFILE_LIST'} PanelArchetype */

export const MENU_SCREEN_METRICS = {
  MAIN_MENU: {
    archetype: 'BUTTON_STACK',
    scaleMode: 'vanilla',
    buttonStack: { centerX: 400, startY: 88, gap: 8 },
    corners: { checkmark: false, trash: false, leave: false },
  },
  OPTIONS: {
    archetype: 'OPTIONS_PANEL',
    scaleMode: 'vanilla',
    /** Original game: 4 rows (brick, renderer, dialogue, music) */
    optionStack: { centerX: 400, startY: 52, gap: 10, rowCount: 4 },
    helpWidget: { ...OPTIONS_CONTRACT },
    corners: { checkmark: true, trash: false, leave: false },
  },
  CREDITS: {
    archetype: 'CREDITS_SCROLL',
    scaleMode: 'vanilla',
    scrollPanel: { ...CREDITS_CONTRACT.scrollPanel },
    scrollStyle: { ...CREDITS_CONTRACT.scrollStyle },
    corners: { checkmark: true, trash: false, leave: false },
  },
  AUTHENTICATION: {
    archetype: 'PROFILE_LIST',
    scaleMode: AUTH_CONTRACT.scaleMode,
    profileList: {
      x: AUTH_CONTRACT.profileList.left,
      y: AUTH_CONTRACT.profileList.top,
      rowWidth: AUTH_CONTRACT.profileList.rowWidth,
      rowHeight: AUTH_CONTRACT.profileList.rowHeight,
      rowGap: AUTH_CONTRACT.profileList.gap,
      maxRows: AUTH_CONTRACT.profileList.maxRows,
    },
    nameOverlay: {
      left: AUTH_CONTRACT.nameField.left,
      width: AUTH_CONTRACT.nameField.width,
    },
    nameTypography: {
      fontSize: AUTH_CONTRACT.nameField.fontSize,
      fontWeight: AUTH_CONTRACT.nameField.fontWeight,
      maxLength: AUTH_CONTRACT.nameField.maxLength,
    },
    enterNameBanner: { ...AUTH_CONTRACT.enterNameBanner },
    hdAssets: {
      background: 'background.png',
      enterName: 'text-updated.png',
      ranks: {
        page2: 'page_2.png',
        page4: 'page_4.png',
        knight2: 'knight_2.png',
        knight4: 'knight_4.png',
        baronet2: 'baronet_2.png',
        baronet4: 'baronet_4.png',
      },
    },
    corners: { checkmark: true, trash: true, leave: false },
  },
  START_WORLD: {
    archetype: 'DUAL_HEADER',
    holderCenter: { ...START_WORLD_HOLDER_CENTER },
    header: { width: 519, height: 57, tabWidth: 141, tabGap: 8, tabInset: 50 },
    startLayout: { ...START_CONTRACT },
    holderVariant: 'WORLD_LIGHT',
    corners: { checkmark: true, trash: false, leave: true },
  },
  MY_MODELS: {
    archetype: 'SINGLE_HEADER',
    holderCenter: { ...SINGLE_HEADER_HOLDER_CENTER },
    singleHeaderLayout: { ...MY_MODELS_CONTRACT },
    holderVariant: 'MY_MODELS',
    corners: { checkmark: true, trash: false, leave: false },
  },
  SNAPSHOT: {
    archetype: 'SINGLE_HEADER',
    holderCenter: { ...SINGLE_HEADER_HOLDER_CENTER },
    singleHeaderLayout: { ...SNAPSHOT_CONTRACT },
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
    '--msl-leave-x': `${MENU_CORNERS.leave.x}px`,
    '--msl-leave-y': `${MENU_CORNERS.leave.y}px`,
  };

  if (screenKey === 'AUTHENTICATION') {
    Object.assign(vars, authLayoutToCssVars(AUTH_CONTRACT));
  } else if (screenKey === 'CREDITS') {
    Object.assign(vars, creditsLayoutToCssVars(CREDITS_CONTRACT));
    vars['--msl-check-x'] = `${MENU_CORNERS.checkmark.x}px`;
    vars['--msl-check-bottom'] = `${MENU_CORNERS.checkmark.bottom}px`;
    vars['--msl-corner-btn-size'] = `${MENU_CORNER_INSET.buttonSize}px`;
  } else if (screenKey === 'OPTIONS') {
    Object.assign(vars, optionsLayoutToCssVars(OPTIONS_CONTRACT));
    vars['--msl-check-x'] = `${MENU_CORNERS.checkmark.x}px`;
    vars['--msl-check-bottom'] = `${MENU_CORNERS.checkmark.bottom}px`;
    vars['--msl-corner-btn-size'] = `${MENU_CORNER_INSET.buttonSize}px`;
  } else if (screenKey === 'START_WORLD') {
    Object.assign(vars, startLayoutToCssVars(START_CONTRACT));
    vars['--msl-check-x'] = `${MENU_CORNERS.checkmark.x}px`;
    vars['--msl-check-bottom'] = `${MENU_CORNERS.checkmark.bottom}px`;
    vars['--msl-corner-btn-size'] = `${MENU_CORNER_INSET.buttonSize}px`;
  } else if (screenKey === 'MY_MODELS') {
    Object.assign(vars, singleHeaderLayoutToCssVars(MY_MODELS_CONTRACT));
    vars['--msl-check-x'] = `${MENU_CORNERS.checkmark.x}px`;
    vars['--msl-check-bottom'] = `${MENU_CORNERS.checkmark.bottom}px`;
    vars['--msl-corner-btn-size'] = `${MENU_CORNER_INSET.buttonSize}px`;
  } else if (screenKey === 'SNAPSHOT') {
    Object.assign(vars, singleHeaderLayoutToCssVars(SNAPSHOT_CONTRACT));
    vars['--msl-check-x'] = `${MENU_CORNERS.checkmark.x}px`;
    vars['--msl-check-bottom'] = `${MENU_CORNERS.checkmark.bottom}px`;
    vars['--msl-corner-btn-size'] = `${MENU_CORNER_INSET.buttonSize}px`;
  } else {
    vars['--msl-check-x'] = `${MENU_CORNERS.checkmark.x}px`;
    vars['--msl-check-bottom'] = `${MENU_CORNERS.checkmark.bottom}px`;
    vars['--msl-trash-x'] = `${MENU_CORNERS.trash.x}px`;
    vars['--msl-trash-bottom'] = `${MENU_CORNERS.trash.bottom}px`;
    vars['--msl-corner-btn-size'] = `${MENU_CORNER_INSET.buttonSize}px`;
  }

  if (screen?.buttonStack) {
    vars['--main-menu-btn-gap'] = `${screen.buttonStack.gap}px`;
  }

  if (screen?.optionStack) {
    vars['--options-stack-gap'] = `${screen.optionStack.gap}px`;
    vars['--options-stack-pt'] = `${screen.optionStack.startY}px`;
  }

  if (screen?.holderCenter && !['START_WORLD', 'MY_MODELS', 'SNAPSHOT'].includes(screenKey)) {
    vars['--msl-holder-cx'] = `${screen.holderCenter.x}px`;
    vars['--msl-holder-cy'] = `${screen.holderCenter.y}px`;
  }

  if (screen?.header) {
    vars['--start-header-w'] = `${screen.header.width}px`;
    vars['--start-header-h'] = `${screen.header.height}px`;
    vars['--start-tab-w'] = `${screen.header.tabWidth}px`;
    vars['--start-tab-gap'] = `${screen.header.tabGap}px`;
    if (screen.header.tabInset != null) {
      vars['--start-tab-inset'] = `${screen.header.tabInset}px`;
    }
  }

  if (screen?.profileList && screenKey !== 'AUTHENTICATION') {
    const { x, y, rowWidth, rowHeight, rowGap } = screen.profileList;
    vars['--auth-list-x'] = `${x}px`;
    vars['--auth-list-y'] = `${y}px`;
    vars['--auth-row-w'] = `${rowWidth}px`;
    vars['--auth-row-h'] = `${rowHeight}px`;
    if (rowGap != null) {
      vars['--auth-row-gap'] = `${rowGap}px`;
    }
  }
  if (screen?.nameOverlay && screenKey !== 'AUTHENTICATION') {
    vars['--auth-name-left'] = `${screen.nameOverlay.left}px`;
    vars['--auth-name-w'] = `${screen.nameOverlay.width}px`;
  }
  if (screen?.enterNameBanner && screenKey !== 'AUTHENTICATION') {
    vars['--auth-banner-x'] = `${screen.enterNameBanner.x}px`;
    if (screen.enterNameBanner.y != null) {
      vars['--auth-banner-y'] = `${screen.enterNameBanner.y}px`;
    }
  }

  return vars;
};

export const rectToStyle = ({ x, y, width, height }) => ({
  left: `${x}px`,
  top: `${y}px`,
  width: `${width}px`,
  height: `${height}px`,
});