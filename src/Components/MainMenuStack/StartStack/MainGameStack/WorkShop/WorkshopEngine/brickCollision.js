import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import { STUD } from './studGrid';

const OVERLAP_EPSILON = 1e-4;

/**
 * Footprint width/depth in studs after Y-axis rotation (90° steps).
 * @param {import('three').Object3D} brick
 */
export const getOrientedStuds = (brick) => {
  const recipe = resolveBrickRecipe(brick.userData?.brickId);
  const quarterTurns = ((Math.round(brick.rotation.y / (Math.PI / 2)) % 4) + 4) % 4;
  const swapped = quarterTurns % 2 === 1;
  return {
    w: swapped ? recipe.studs.d : recipe.studs.w,
    d: swapped ? recipe.studs.w : recipe.studs.d,
  };
};

/**
 * @param {import('three').Object3D} brick
 */
export const getBrickXZBounds = (brick) => {
  const { w, d } = getOrientedStuds(brick);
  const halfW = (w * STUD) / 2;
  const halfD = (d * STUD) / 2;
  return {
    xMin: brick.position.x - halfW,
    xMax: brick.position.x + halfW,
    zMin: brick.position.z - halfD,
    zMax: brick.position.z + halfD,
  };
};

/**
 * @param {import('three').Object3D} brick
 */
export const getBrickVerticalRange = (brick) => {
  const recipe = resolveBrickRecipe(brick.userData?.brickId);
  const bottom = brick.position.y;
  return {
    bottom,
    top: bottom + recipeHeight(recipe),
  };
};

const xzBoundsOverlap = (a, b) =>
  a.xMin < b.xMax - OVERLAP_EPSILON
  && b.xMin < a.xMax - OVERLAP_EPSILON
  && a.zMin < b.zMax - OVERLAP_EPSILON
  && b.zMin < a.zMax - OVERLAP_EPSILON;

const verticalRangesOverlap = (a, b) =>
  a.bottom < b.top - OVERLAP_EPSILON && b.bottom < a.top - OVERLAP_EPSILON;

/**
 * @param {import('three').Object3D} a
 * @param {import('three').Object3D} b
 */
export const bricksOverlap = (a, b) => {
  if (!a?.isBrick || !b?.isBrick || a === b) {
    return false;
  }
  if (!verticalRangesOverlap(getBrickVerticalRange(a), getBrickVerticalRange(b))) {
    return false;
  }
  return xzBoundsOverlap(getBrickXZBounds(a), getBrickXZBounds(b));
};

const shouldIgnoreBrick = (other, ignore) => {
  if (!ignore) {
    return false;
  }
  if (ignore === other) {
    return true;
  }
  if (ignore instanceof Set) {
    return ignore.has(other);
  }
  if (Array.isArray(ignore)) {
    return ignore.includes(other);
  }
  return false;
};

/**
 * @param {import('three').Object3D} candidate
 * @param {import('three').Object3D[]} others
 * @param {import('three').Object3D | import('three').Object3D[] | Set<import('three').Object3D> | null} [ignore]
 */
export const brickCollidesWithAny = (candidate, others, ignore = null) =>
  others.some((other) => other !== candidate
    && !shouldIgnoreBrick(other, ignore)
    && other?.isBrick
    && bricksOverlap(candidate, other));