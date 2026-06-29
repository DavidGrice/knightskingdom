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
    downArrow: { x: 260, y: 386 },
    help: { x: 445, y: 424 },
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
    downArrow: { x: 260, y: 386 },
    help: { x: 445, y: 424 },
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
    upArrow: { x: 260, y: 76 },
    downArrow: { x: 260, y: 442 },
    help: { x: 449, y: 479 },
    footer: { left: 90, top: 484, width: 260, height: 72, gap: 37 },
    ...CELL,
    ...GRID_GAP,
  },
  /**
   * Workshop brick bucket — 238×556 drop_down.png, 2×3 grid.
   * Pixel-mapped from drop_down.png + legacy BucketBottom % (see grok/analyze-workshop-images.mjs).
   */
  WORKSHOP_BUCKET: {
    className: 'variantWorkshopBucket',
    bodyWidth: 238,
    bodyHeight: 556,
    gridColumns: 2,
    gridRows: 3,
    gridLeft: 2,
    /** Dark-red brick recess bands in drop_down.png ≈ y 430–466 */
    gridTop: 260,
    upArrow: { x: 99, y: 231 },
    downArrow: { x: 99, y: 521 },
    help: null,
    footer: null,
    width: 82,
    height: 58,
    x: 32,
    y: 20,
    tabs: {
      top: 22,
      left: 14,
      width: 210,
      /** 3×70px cells + 2×2px row gaps = 214px */
      height: 214,
      cols: 3,
      cell: 70,
      rowGap: 2,
      colGap: 0,
    },
  },
};

export const getWorldHolderVariant = (isLocalWorlds) => (
  isLocalWorlds ? HOLDER_VARIANTS.WORLD_LIGHT : HOLDER_VARIANTS.WORLD_DARK
);