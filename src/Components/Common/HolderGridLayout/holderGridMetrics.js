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
    /** Oval tray at bottom of dark_drop_down.png — icons sit in recess */
    footer: { left: 62, bottom: 35, width: 285, height: 71, gap: 8 },
    ...CELL,
    ...GRID_GAP,
  },
  SNAPSHOT: {
    className: 'variantSnapshot',
    /** Native snapshot_holder.png — was 530, asset is 516×541 */
    bodyWidth: 516,
    bodyHeight: 541,
    gridLeft: 70,
    gridTop: 59,
    upArrow: { x: 258, y: 22 },
    downArrow: { x: 258, y: 380 },
    /** Align with world / MyModels Richard — prior x:473 sat too far right */
    help: { x: 445, y: 418 },
    /** Oval tray — MyModels-style top anchor, shorter icons (see SnapShotBody.module.css) */
    footer: { left: 53, top: 436, width: 300, height: 58, gap: 10 },
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
    gridLeft: 12,
    /** Dark-red brick recess bands in drop_down.png ≈ y 430–466 */
    gridTop: 260,
    upArrow: { x: 109, y: 231 },
    downArrow: { x: 109, y: 521 },
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