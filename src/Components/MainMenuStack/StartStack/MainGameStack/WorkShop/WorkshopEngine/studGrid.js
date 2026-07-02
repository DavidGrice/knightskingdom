/** LEGO stud grid — 1 stud = 8mm; 0.8 world units per stud. */
export const STUD = 0.8;
export const HALF_STUD = STUD / 2;
export const PLATE_HEIGHT = STUD / 3;
export const BRICK_HEIGHT = STUD;

/** Visual build plate (full viewport area). */
export const BUILD_PLATE_STUDS = 32;
export const BUILD_PLATE_SIZE = BUILD_PLATE_STUDS * STUD;

/**
 * Finite stud region for save/export to main world (centered on origin).
 * Visual plate can be larger; only bricks inside this region are exported.
 */
export const EXPORT_PLATE_STUDS = 16;
export const EXPORT_PLATE_SIZE = EXPORT_PLATE_STUDS * STUD;
export const EXPORT_HALF = EXPORT_PLATE_SIZE / 2;

const BOUNDS_EPSILON = 1e-3;

/**
 * Snap one axis to a valid brick-center line for a footprint `studCount` studs wide/deep.
 * 1-wide → integer studs (0, 0.8…); 2-wide → half-stud centers (0.4, 1.2…).
 * @param {number} worldCoord
 * @param {number} studCount
 */
export const snapBrickCenterAxis = (worldCoord, studCount) => {
  const phase = ((studCount - 1) / 2) * STUD;
  return Math.round((worldCoord - phase) / STUD) * STUD + phase;
};

/**
 * @param {number} x
 * @param {number} z
 * @param {number} w
 * @param {number} d
 */
export const snapBrickCenterXZ = (x, z, w, d) => ({
  x: snapBrickCenterAxis(x, w),
  z: snapBrickCenterAxis(z, d),
});

/**
 * @param {number} cx
 * @param {number} cz
 * @param {number} w
 * @param {number} d
 */
export const footprintWithinExportBounds = (cx, cz, w, d) => {
  const halfW = (w * STUD) / 2;
  const halfD = (d * STUD) / 2;
  return Math.abs(cx) + halfW <= EXPORT_HALF + BOUNDS_EPSILON
    && Math.abs(cz) + halfD <= EXPORT_HALF + BOUNDS_EPSILON;
};

/**
 * Snap brick center to stud grid, then clamp footprint inside export bounds.
 * @param {number} x
 * @param {number} z
 * @param {number} w
 * @param {number} d
 */
export const clampBrickCenterToExport = (x, z, w, d) => {
  const halfW = (w * STUD) / 2;
  const halfD = (d * STUD) / 2;
  let cx = snapBrickCenterAxis(x, w);
  let cz = snapBrickCenterAxis(z, d);
  cx = Math.max(-EXPORT_HALF + halfW, Math.min(EXPORT_HALF - halfW, cx));
  cz = Math.max(-EXPORT_HALF + halfD, Math.min(EXPORT_HALF - halfD, cz));
  return { x: cx, z: cz };
};

/**
 * @param {{ x: number, y?: number, z: number }} position
 * @param {number} w
 * @param {number} d
 */
export const snapPositionForBrick = (position, w, d) => ({
  x: snapBrickCenterAxis(position.x, w),
  y: position.y,
  z: snapBrickCenterAxis(position.z, d),
});

/** @deprecated Use snapBrickCenterAxis with footprint width. */
export const snapStud = (value) => snapBrickCenterAxis(value, 1);

export const snapPositionToStud = (position) =>
  snapPositionForBrick(position, 1, 1);

export const snapYToPlate = (y) => Math.max(0, Math.round(y / PLATE_HEIGHT) * PLATE_HEIGHT);

/** Snap Y to multiples of a brick's own height (minimum 0). */
export const snapYToHeight = (y, height) => {
  if (!height || height <= 0) {
    return Math.max(0, y);
  }
  return Math.max(0, Math.round(y / height) * height);
};

/** @deprecated Use snapBrickCenterXZ with brick footprint. */
export const snapXZToStud = (x, z) => snapBrickCenterXZ(x, z, 1, 1);

export const isWithinExportBounds = (x, z) =>
  Math.abs(x) <= EXPORT_HALF && Math.abs(z) <= EXPORT_HALF;

/** @deprecated Use clampBrickCenterToExport with brick footprint. */
export const clampXZToExportBounds = (x, z) =>
  clampBrickCenterToExport(x, z, 1, 1);