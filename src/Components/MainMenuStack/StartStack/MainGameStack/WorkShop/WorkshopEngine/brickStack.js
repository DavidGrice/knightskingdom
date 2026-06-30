import { PLATE_HEIGHT } from './studGrid';
import { getBrickVerticalRange, getBrickXZBounds } from './brickCollision';

const STACK_Y_EPSILON = PLATE_HEIGHT * 0.5;

const xzBoundsOverlap = (a, b) =>
  a.xMin < b.xMax - 1e-4
  && b.xMin < a.xMax - 1e-4
  && a.zMin < b.zMax - 1e-4
  && b.zMin < a.zMax - 1e-4;

/**
 * True when `upper` sits directly on top of `lower` (XZ overlap, bottoms meet).
 * @param {import('three').Object3D} upper
 * @param {import('three').Object3D} lower
 */
export const isStackedOn = (upper, lower) => {
  if (!upper?.isBrick || !lower?.isBrick || upper === lower) {
    return false;
  }

  const upperRange = getBrickVerticalRange(upper);
  const lowerRange = getBrickVerticalRange(lower);

  if (Math.abs(upperRange.bottom - lowerRange.top) > STACK_Y_EPSILON) {
    return false;
  }

  return xzBoundsOverlap(getBrickXZBounds(upper), getBrickXZBounds(lower));
};

/**
 * All bricks stacked above `base` (transitive).
 * @param {import('three').Object3D} base
 * @param {import('three').Object3D[]} allBricks
 */
export const getBricksStackedAbove = (base, allBricks) => {
  const above = new Set();
  const queue = [base];

  while (queue.length > 0) {
    const current = queue.pop();
    allBricks.forEach((candidate) => {
      if (candidate === base || candidate === current || above.has(candidate)) {
        return;
      }
      if (isStackedOn(candidate, current)) {
        above.add(candidate);
        queue.push(candidate);
      }
    });
  }

  return [...above];
};

/**
 * Selected brick + anything stacked on it. Top brick alone moves solo;
 * bottom brick with a stack above moves the whole column.
 * @param {import('three').Object3D} hitBrick
 * @param {import('three').Object3D[]} allBricks
 */
export const getBrickMoveGroup = (hitBrick, allBricks) => {
  if (!hitBrick?.isBrick) {
    return [];
  }
  return [hitBrick, ...getBricksStackedAbove(hitBrick, allBricks)];
};