/** LEGO stud grid — 1 stud = 8mm; 0.8 world units per stud. */
export const STUD = 0.8;
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

export const snapStud = (value) => Math.round(value / STUD) * STUD;

export const snapPositionToStud = (position) => ({
  x: snapStud(position.x),
  y: position.y,
  z: snapStud(position.z),
});

export const snapYToPlate = (y) => Math.max(0, Math.round(y / PLATE_HEIGHT) * PLATE_HEIGHT);

export const snapXZToStud = (x, z) => ({
  x: snapStud(x),
  z: snapStud(z),
});

export const isWithinExportBounds = (x, z) =>
  Math.abs(x) <= EXPORT_HALF && Math.abs(z) <= EXPORT_HALF;

export const clampXZToExportBounds = (x, z) => {
  const snapped = snapXZToStud(x, z);
  return {
    x: Math.max(-EXPORT_HALF, Math.min(EXPORT_HALF, snapped.x)),
    z: Math.max(-EXPORT_HALF, Math.min(EXPORT_HALF, snapped.z)),
  };
};