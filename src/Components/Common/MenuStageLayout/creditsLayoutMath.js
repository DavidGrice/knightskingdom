/**
 * Credits scroll panel on main_image.png (800×600).
 * Anchors derived from yellow-trim banner bbox (see grok/analyze-credits-banner.mjs).
 */

export const CREDITS_CANVAS = { width: 800, height: 600 };

/** Measured yellow-trim outline of the left hanging banner */
export const CREDITS_BANNER_TRIM = {
  x: 55,
  y: 13,
  width: 305,
  height: 423,
};

/** Insets inside trim — clears pole, side borders, and pointed bottom */
export const CREDITS_BANNER_INSET = {
  top: 58,
  bottom: 55,
  side: 44,
};

/** Fine-tune after visual pass — right/down nudge on blue fill */
export const CREDITS_PANEL_OFFSET = {
  x: 16,
  y: 28,
};

/** Dark scroller plate width inside the banner */
export const CREDITS_SCROLL_WIDTH = 232;

export const CREDITS_SCROLL_STYLE = {
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: 10,
  paddingX: 10,
  paddingY: 8,
};

/** Per-level credits typography (800×600 canvas px) — each tier visually distinct */
export const CREDITS_TYPOGRAPHY = {
  color: '#ffffc6',
  /** Title banner — "Credits" */
  h1: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  /** Section — Developers, Special Thanks */
  h2: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  /** Subsection — Asset Extraction, Discord Helpers */
  h3: {
    fontSize: 13,
    fontWeight: 500,
    fontStyle: 'italic',
    lineHeight: 1.35,
    letterSpacing: '0.04em',
    opacity: 0.92,
  },
  /** Contributor names */
  p: {
    fontSize: 12,
    fontWeight: 300,
    lineHeight: 1.45,
    letterSpacing: '0.02em',
    opacity: 0.88,
  },
};

/** Canvas px scrolled per second (one track height per derived duration) */
export const CREDITS_SCROLL_PX_PER_SEC = 16;

/** Fallback when track height is not measured yet */
export const CREDITS_SCROLL_DURATION_SEC = 36;

/** Blank canvas px between end of list and next "Credits" title at loop seam */
export const CREDITS_LOOP_GAP = 40;

/**
 * Position scroll panel on banner trim center + manual offset.
 */
export const computeCreditsScrollPanel = (opts = {}) => {
  const trim = opts.trim ?? CREDITS_BANNER_TRIM;
  const inset = opts.inset ?? CREDITS_BANNER_INSET;
  const offset = opts.offset ?? CREDITS_PANEL_OFFSET;
  const scrollWidth = opts.scrollWidth ?? CREDITS_SCROLL_WIDTH;

  const centerX = trim.x + trim.width / 2 + offset.x;
  const left = Math.round(centerX - scrollWidth / 2);
  const top = trim.y + inset.top + offset.y;
  const height = trim.y + trim.height - inset.bottom - (trim.y + inset.top);

  return {
    left,
    top,
    width: scrollWidth,
    height,
    centerX,
    trimCenterX: trim.x + trim.width / 2,
  };
};

export const buildCreditsLayoutContract = () => {
  const scrollPanel = computeCreditsScrollPanel();
  return {
    version: 1,
    screenKey: 'CREDITS',
    scaleMode: 'vanilla',
    canvas: { ...CREDITS_CANVAS },
    bannerTrim: { ...CREDITS_BANNER_TRIM },
    panelOffset: { ...CREDITS_PANEL_OFFSET },
    scrollPanel,
    scrollStyle: { ...CREDITS_SCROLL_STYLE },
    typography: { ...CREDITS_TYPOGRAPHY },
    scrollDurationSec: CREDITS_SCROLL_DURATION_SEC,
    loopGap: CREDITS_LOOP_GAP,
  };
};

const levelToCssVars = (prefix, level) => {
  const vars = {
    [`--credits-${prefix}-size`]: `${level.fontSize}px`,
    [`--credits-${prefix}-weight`]: String(level.fontWeight),
    [`--credits-${prefix}-line-height`]: String(level.lineHeight),
    [`--credits-${prefix}-letter-spacing`]: level.letterSpacing,
  };
  if (level.textTransform) {
    vars[`--credits-${prefix}-text-transform`] = level.textTransform;
  }
  if (level.fontStyle) {
    vars[`--credits-${prefix}-font-style`] = level.fontStyle;
  }
  if (level.opacity != null) {
    vars[`--credits-${prefix}-opacity`] = String(level.opacity);
  }
  return vars;
};

export const creditsLayoutToCssVars = (contract = buildCreditsLayoutContract()) => {
  const { scrollPanel, scrollStyle, typography } = contract;
  return {
    '--credits-scroll-x': `${scrollPanel.left}px`,
    '--credits-scroll-y': `${scrollPanel.top}px`,
    '--credits-scroll-w': `${scrollPanel.width}px`,
    '--credits-scroll-h': `${scrollPanel.height}px`,
    '--credits-scroll-bg': scrollStyle.background,
    '--credits-scroll-radius': `${scrollStyle.borderRadius}px`,
    '--credits-scroll-px': `${scrollStyle.paddingX}px`,
    '--credits-scroll-py': `${scrollStyle.paddingY}px`,
    '--credits-text-color': typography.color,
    '--credits-scroll-duration': `${contract.scrollDurationSec}s`,
    '--credits-loop-gap': `${contract.loopGap ?? CREDITS_LOOP_GAP}px`,
    ...levelToCssVars('h1', typography.h1),
    ...levelToCssVars('h2', typography.h2),
    ...levelToCssVars('h3', typography.h3),
    ...levelToCssVars('p', typography.p),
  };
};