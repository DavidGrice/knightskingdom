/**
 * Pixel anchors measured from holder PNG assets (519×530 world/snapshot family).
 * Grid cells: 109×80, column gap 23px, row gap 28px.
 */

const CELL = { width: 109, height: 80 };
const GRID_GAP = { x: 23, y: 28 };

/** @typedef {typeof HOLDER_VARIANTS[keyof typeof HOLDER_VARIANTS]} HolderVariant */

export const HOLDER_VARIANTS = {
  WORLD_LIGHT: {
    className: 'variantWorldLight',
    bodyWidth: 519,
    bodyHeight: 530,
    gridLeft: 74,
    gridTop: 95,
    upArrow: { x: 259, y: 30 },
    downArrow: { x: 259, y: 400 },
    help: { x: 476, y: 447 },
    footer: null,
    ...CELL,
    ...GRID_GAP,
  },
  WORLD_DARK: {
    className: 'variantWorldDark',
    bodyWidth: 519,
    bodyHeight: 530,
    gridLeft: 74,
    gridTop: 95,
    upArrow: { x: 259, y: 30 },
    downArrow: { x: 259, y: 400 },
    help: { x: 452, y: 427 },
    footer: { left: 78, bottom: 32, width: 285, height: 71, gap: 8 },
    ...CELL,
    ...GRID_GAP,
  },
  SNAPSHOT: {
    className: 'variantSnapshot',
    bodyWidth: 516,
    bodyHeight: 530,
    gridLeft: 70,
    gridTop: 98,
    upArrow: { x: 258, y: 30 },
    downArrow: { x: 258, y: 403 },
    help: { x: 473, y: 450 },
    footer: { left: 4, bottom: 48, width: 388, height: 72, gap: 37 },
    ...CELL,
    ...GRID_GAP,
  },
  MY_MODELS: {
    className: 'variantMyModels',
    bodyWidth: 519,
    bodyHeight: 587,
    gridLeft: 74,
    gridTop: 152,
    upArrow: { x: 259, y: 30 },
    downArrow: { x: 259, y: 448 },
    help: { x: 449, y: 472 },
    footer: { left: 74, top: 418, width: 280, height: 72, gap: 37 },
    ...CELL,
    ...GRID_GAP,
  },
};

export const getWorldHolderVariant = (isLocalWorlds) => (
  isLocalWorlds ? HOLDER_VARIANTS.WORLD_LIGHT : HOLDER_VARIANTS.WORLD_DARK
);