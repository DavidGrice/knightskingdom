const CANVAS_W = 800;
const CANVAS_H = 600;

/** Source rank row sprites (webpack / auth-hd) */
export const AUTH_ROW_SOURCE = {
  width: 528,
  height: 99,
};

/** Logical size on the 800×600 parchment (measured ~280×56, see grok/analyze-auth-background.mjs) */
export const AUTH_ROW_DISPLAY = {
  width: 280,
  height: 56,
  gap: 8,
  maxRows: 5,
};

/** @deprecated Use AUTH_ROW_SOURCE */
export const AUTH_ROW_NATIVE = AUTH_ROW_SOURCE;

/** Safe zone inside 800×600 background (px) */
export const AUTH_SAFE_ZONE = {
  top: 32,
  /** Clears mirrored corner buttons on bottom parchment */
  bottom: 115,
  bannerTop: 28,
};

const scaleNameOverlay = (px) =>
  Math.round(px * (AUTH_ROW_DISPLAY.width / AUTH_ROW_SOURCE.width));

/** Name text anchors — scaled from original 200px / 280px on 528px-wide sprites */
export const AUTH_NAME_OVERLAY = {
  left: scaleNameOverlay(200),
  width: scaleNameOverlay(280),
};

/**
 * Fit profile stack between safe top/bottom; center horizontally on canvas.
 * @param {object} [opts]
 */
export const computeAuthProfileLayout = (opts = {}) => {
  const canvasW = opts.canvasWidth ?? CANVAS_W;
  const canvasH = opts.canvasHeight ?? CANVAS_H;
  const rowCount = opts.rowCount ?? AUTH_ROW_DISPLAY.maxRows;
  const rowWidth = opts.rowWidth ?? AUTH_ROW_DISPLAY.width;
  const rowHeight = opts.rowHeight ?? AUTH_ROW_DISPLAY.height;
  const rowGap = opts.rowGap ?? AUTH_ROW_DISPLAY.gap;
  const safeTop = opts.safeTop ?? AUTH_SAFE_ZONE.top;
  const safeBottom = opts.safeBottom ?? AUTH_SAFE_ZONE.bottom;

  const stackH = rowCount * rowHeight + Math.max(0, rowCount - 1) * rowGap;
  const innerH = canvasH - safeTop - safeBottom;
  const listTop = safeTop + Math.max(0, (innerH - stackH) / 2);
  const stackBottom = listTop + stackH;
  const listLeft = Math.round((canvasW - rowWidth) / 2);

  return {
    listTop: Math.round(listTop),
    listLeft,
    listCenterX: listLeft + rowWidth / 2,
    stackH,
    stackBottom,
    rowWidth,
    rowHeight,
    rowGap,
    fits: stackBottom <= canvasH - safeBottom,
  };
};