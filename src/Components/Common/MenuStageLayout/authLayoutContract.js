/**
 * Single source of truth for authentication screen layout on the 800×600 canvas.
 * All CSS vars, components, and regression tests should import from here.
 *
 * Viewport scale (--msl-scale) only letterboxes the stage; canvas-relative
 * geometry from this contract stays identical at every viewport size.
 */

import {
  computeAuthProfileLayout,
  AUTH_ROW_SOURCE,
  AUTH_ROW_DISPLAY,
  AUTH_SAFE_ZONE,
  AUTH_NAME_OVERLAY,
} from './authLayoutMath.js';

export const AUTH_CANVAS = { width: 800, height: 600 };

/** Symmetric bottom corner controls */
export const AUTH_CORNER_INSET = {
  x: 120,
  bottom: 10,
  buttonSize: 72,
};

export const AUTH_CORNERS = {
  checkmark: { x: AUTH_CORNER_INSET.x, bottom: AUTH_CORNER_INSET.bottom },
  trash: {
    x: AUTH_CANVAS.width - AUTH_CORNER_INSET.x,
    bottom: AUTH_CORNER_INSET.bottom,
  },
};

export const AUTH_NAME_TYPOGRAPHY = {
  fontSize: 14,
  fontWeight: 300,
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: '#ffffc6',
  lineHeight: 1,
};

/**
 * Derive safe max name length from field width + font metrics.
 * Uses conservative average glyph width (0.55 × fontSize) minus padding.
 * @param {number} [fieldWidth]
 * @param {number} [fontSize]
 */
export const computeAuthNameMaxLength = (
  fieldWidth = AUTH_NAME_OVERLAY.width,
  fontSize = AUTH_NAME_TYPOGRAPHY.fontSize,
) => {
  const padding = 12;
  const avgCharWidth = fontSize * 0.62;
  return Math.max(4, Math.floor((fieldWidth - padding) / avgCharWidth));
};

export const AUTH_NAME_MAX_LENGTH = computeAuthNameMaxLength();

/**
 * Full layout snapshot for AUTHENTICATION screen.
 * @param {object} [opts] — forwarded to computeAuthProfileLayout
 */
export const buildAuthLayoutContract = (opts = {}) => {
  const layout = computeAuthProfileLayout({
    canvasWidth: AUTH_CANVAS.width,
    canvasHeight: AUTH_CANVAS.height,
    ...opts,
  });

  return {
    version: 1,
    screenKey: 'AUTHENTICATION',
    scaleMode: 'modern',
    canvas: { ...AUTH_CANVAS },
    rowSource: { ...AUTH_ROW_SOURCE },
    rowDisplay: { ...AUTH_ROW_DISPLAY },
    safeZone: { ...AUTH_SAFE_ZONE },
    profileList: {
      left: layout.listLeft,
      top: layout.listTop,
      centerX: layout.listCenterX,
      rowWidth: layout.rowWidth,
      rowHeight: layout.rowHeight,
      gap: layout.rowGap,
      maxRows: AUTH_ROW_DISPLAY.maxRows,
      stackHeight: layout.stackH,
      stackBottom: layout.stackBottom,
    },
    nameField: {
      left: AUTH_NAME_OVERLAY.left,
      width: AUTH_NAME_OVERLAY.width,
      maxLength: AUTH_NAME_MAX_LENGTH,
      ...AUTH_NAME_TYPOGRAPHY,
    },
    corners: {
      insetX: AUTH_CORNER_INSET.x,
      bottom: AUTH_CORNER_INSET.bottom,
      buttonSize: AUTH_CORNER_INSET.buttonSize,
      checkmark: { ...AUTH_CORNERS.checkmark },
      trash: { ...AUTH_CORNERS.trash },
    },
    enterNameBanner: { x: 512, y: AUTH_SAFE_ZONE.bannerTop },
    invariants: {
      listCentered: layout.listCenterX === AUTH_CANVAS.width / 2,
      trashMirrorsCheckmark:
        AUTH_CORNERS.trash.x === AUTH_CANVAS.width - AUTH_CORNERS.checkmark.x,
      stackFitsSafeZone: layout.fits,
    },
  };
};

/** CSS custom properties for authentication layout */
export const authLayoutToCssVars = (contract = buildAuthLayoutContract()) => {
  const { profileList: list, nameField, corners, enterNameBanner } = contract;

  return {
    '--auth-list-x': `${list.left}px`,
    '--auth-list-y': `${list.top}px`,
    '--auth-row-w': `${list.rowWidth}px`,
    '--auth-row-h': `${list.rowHeight}px`,
    '--auth-row-gap': `${list.gap}px`,
    '--auth-name-left': `${nameField.left}px`,
    '--auth-name-w': `${nameField.width}px`,
    '--auth-name-font-size': `${nameField.fontSize}px`,
    '--auth-name-font-weight': String(nameField.fontWeight),
    '--auth-name-color': nameField.color,
    '--auth-name-line-height': String(nameField.lineHeight),
    '--auth-banner-x': `${enterNameBanner.x}px`,
    '--auth-banner-y': `${enterNameBanner.y}px`,
    '--msl-check-x': `${corners.checkmark.x}px`,
    '--msl-check-bottom': `${corners.checkmark.bottom}px`,
    '--msl-trash-x': `${corners.trash.x}px`,
    '--msl-trash-bottom': `${corners.trash.bottom}px`,
    '--msl-corner-btn-size': `${corners.buttonSize}px`,
  };
};