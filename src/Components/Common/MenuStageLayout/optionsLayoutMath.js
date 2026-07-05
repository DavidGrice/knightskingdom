/**
 * Options Richard help — 800×600 canvas.
 *
 * Alignment is tuned at layoutScale 1 (native blob + frame fit + offset).
 * OPTIONS_HELP_LAYOUT_SCALE shrinks/grows blob + Richard together (same ratios).
 * Corner anchor stays fixed on the castle port.
 *
 * Run: node grok/analyze-options-help.mjs
 */

/** Native blue blob sprite */
export const OPTIONS_HELP_BIN = { width: 169, height: 123 };

/** Native Richard frame sprite (dark_help_*.png) */
export const OPTIONS_HELP_FRAME_NATIVE = { width: 120, height: 103 };

/** Circular hole in richard_placeholder — native sprite px */
export const OPTIONS_HELP_HOLE = {
  cx: 79,
  cy: 53,
  diameter: 83,
};

/** Corner anchor: bin center-x, inset from canvas bottom (not scaled) */
export const OPTIONS_HELP_CORNER = { x: 662, bottom: 6 };

/** Richard scale + offset tuned at layoutScale 1 */
export const OPTIONS_HELP_FRAME_SCALE = 1.45;
export const OPTIONS_HELP_FRAME_OFFSET = { x: 3, y: 16 };

/**
 * Display scaler — blob + Richard + in-bin positions; preserves alignment ratios.
 * Corner anchor unchanged. Tune here if the pair is too large/small on screen.
 */
export const OPTIONS_HELP_LAYOUT_SCALE = 0.82;

const roundPx = (n) => Math.round(n);

/** Frame base size — hole diameter mapped to native sprite aspect */
export const computeOptionsHelpFrameSize = (
  holeDiameter = OPTIONS_HELP_HOLE.diameter,
  native = OPTIONS_HELP_FRAME_NATIVE,
) => {
  const fit = holeDiameter / native.width;
  return {
    width: roundPx(native.width * fit),
    height: roundPx(native.height * fit),
  };
};

/** Uniform scaler for in-bin geometry (blob, hole, frame size, frame position) */
export const scaleOptionsHelpLayout = (value, layoutScale = OPTIONS_HELP_LAYOUT_SCALE) => (
  roundPx(value * layoutScale)
);

/**
 * @param {number} [layoutScale] — OPTIONS_HELP_LAYOUT_SCALE
 */
export const buildOptionsLayoutContract = (
  layoutScale = OPTIONS_HELP_LAYOUT_SCALE,
  frameScale = OPTIONS_HELP_FRAME_SCALE,
  frameOffset = OPTIONS_HELP_FRAME_OFFSET,
) => {
  const mul = (n) => scaleOptionsHelpLayout(n, layoutScale);
  const frameSize = computeOptionsHelpFrameSize();
  const frameW = roundPx(frameSize.width * frameScale);
  const frameH = roundPx(frameSize.height * frameScale);
  const frameCx = OPTIONS_HELP_HOLE.cx + frameOffset.x;
  const frameCy = OPTIONS_HELP_HOLE.cy + frameOffset.y;

  return {
    version: 1,
    screenKey: 'OPTIONS',
    layoutScale,
    frameScale,
    frameOffset: { ...frameOffset },
    bin: {
      width: mul(OPTIONS_HELP_BIN.width),
      height: mul(OPTIONS_HELP_BIN.height),
    },
    hole: {
      cx: mul(OPTIONS_HELP_HOLE.cx),
      cy: mul(OPTIONS_HELP_HOLE.cy),
      diameter: mul(OPTIONS_HELP_HOLE.diameter),
    },
    frame: {
      width: mul(frameW),
      height: mul(frameH),
      cx: mul(frameCx),
      cy: mul(frameCy),
    },
    corner: { ...OPTIONS_HELP_CORNER },
    alignmentNative: {
      bin: { ...OPTIONS_HELP_BIN },
      hole: { ...OPTIONS_HELP_HOLE },
      frame: { width: frameW, height: frameH, cx: frameCx, cy: frameCy },
      frameScale,
      frameOffset: { ...frameOffset },
    },
    frameNative: { ...OPTIONS_HELP_FRAME_NATIVE },
    frameSizeNative: frameSize,
  };
};

export const optionsLayoutToCssVars = (contract = buildOptionsLayoutContract()) => {
  const {
    bin, hole, corner, frame, layoutScale, frameScale, frameOffset,
  } = contract;
  return {
    '--options-help-layout-scale': String(layoutScale),
    '--options-help-frame-scale': String(frameScale),
    '--options-help-frame-offset-x': `${frameOffset.x}px`,
    '--options-help-frame-offset-y': `${frameOffset.y}px`,
    '--options-help-w': `${bin.width}px`,
    '--options-help-h': `${bin.height}px`,
    '--options-help-hole-x': `${hole.cx}px`,
    '--options-help-hole-y': `${hole.cy}px`,
    '--options-help-hole-d': `${hole.diameter}px`,
    '--options-help-frame-w': `${frame.width}px`,
    '--options-help-frame-h': `${frame.height}px`,
    '--options-help-frame-left': `${frame.cx}px`,
    '--options-help-frame-top': `${frame.cy}px`,
    '--msl-trash-x': `${corner.x}px`,
    '--msl-trash-bottom': `${corner.bottom}px`,
  };
};