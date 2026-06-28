/**
 * Pixel anchors measured from holder PNG assets.
 * gridTop/gridLeft = top-left of first black slot row (not row center).
 */

const CELL = { width: 109, height: 80 };
const GRID_GAP = { x: 23, y: 28 };

/** @typedef {typeof HOLDER_VARIANTS[keyof typeof HOLDER_VARIANTS]} HolderVariant */

export const HOLDER_VARIANTS = {
  WORLD_LIGHT: {
    className: 'variantWorldLight',
    bodyWidth: 519,
    bodyHeight: 530,
    gridLeft: 76,
    gridTop: 56,
    upArrow: { x: 260, y: 20 },
    downArrow: { x: 260, y: 368 },
    help: { x: 458, y: 412 },
    footer: null,
    ...CELL,
    ...GRID_GAP,
  },
  WORLD_DARK: {
    className: 'variantWorldDark',
    bodyWidth: 519,
    bodyHeight: 530,
    gridLeft: 76,
    gridTop: 56,
    upArrow: { x: 260, y: 20 },
    downArrow: { x: 260, y: 368 },
    help: { x: 458, y: 412 },
    footer: { left: 62, bottom: 42, width: 285, height: 71, gap: 8 },
    ...CELL,
    ...GRID_GAP,
  },
  SNAPSHOT: {
    className: 'variantSnapshot',
    bodyWidth: 516,
    bodyHeight: 530,
    gridLeft: 70,
    gridTop: 59,
    upArrow: { x: 258, y: 22 },
    downArrow: { x: 258, y: 372 },
    help: { x: 473, y: 433 },
    footer: { left: 4, bottom: 44, width: 388, height: 72, gap: 37 },
    ...CELL,
    ...GRID_GAP,
  },
  MY_MODELS: {
    className: 'variantMyModels',
    bodyWidth: 519,
    bodyHeight: 587,
    gridLeft: 76,
    gridTop: 113,
    upArrow: { x: 260, y: 22 },
    downArrow: { x: 260, y: 416 },
    help: { x: 449, y: 458 },
    footer: { left: 90, top: 468, width: 260, height: 72, gap: 37 },
    ...CELL,
    ...GRID_GAP,
  },
};

export const getWorldHolderVariant = (isLocalWorlds) => (
  isLocalWorlds ? HOLDER_VARIANTS.WORLD_LIGHT : HOLDER_VARIANTS.WORLD_DARK
);