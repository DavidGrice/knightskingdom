/** LEGO stud grid — 1 stud = 8mm; 0.8 world units per stud. */
export const STUD = 0.8;
export const PLATE_HEIGHT = STUD / 3;
export const BRICK_HEIGHT = STUD;

export const BUILD_PLATE_STUDS = 32;
export const BUILD_PLATE_SIZE = BUILD_PLATE_STUDS * STUD;

export const snapStud = (value) => Math.round(value / STUD) * STUD;

export const snapPositionToStud = (position) => ({
  x: snapStud(position.x),
  y: position.y,
  z: snapStud(position.z),
});

export const snapXZToStud = (x, z) => ({
  x: snapStud(x),
  z: snapStud(z),
});