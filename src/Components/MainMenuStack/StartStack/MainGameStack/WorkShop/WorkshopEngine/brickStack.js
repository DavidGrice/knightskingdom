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
 * Brick directly under `upper` (highest supporting surface).
 * @param {import('three').Object3D} upper
 * @param {import('three').Object3D[]} allBricks
 */
export const findDirectSupport = (upper, allBricks) => {
  let support = null;
  let supportTop = -Infinity;

  allBricks.forEach((candidate) => {
    if (candidate === upper || !candidate?.isBrick) {
      return;
    }
    if (!isStackedOn(upper, candidate)) {
      return;
    }
    const top = getBrickVerticalRange(candidate).top;
    if (top > supportTop) {
      supportTop = top;
      support = candidate;
    }
  });

  return support;
};

/**
 * Bottom brick of the stack containing `hitBrick` (walk down supports).
 * @param {import('three').Object3D} hitBrick
 * @param {import('three').Object3D[]} allBricks
 */
export const findStackAnchor = (hitBrick, allBricks) => {
  let anchor = hitBrick;
  let support = findDirectSupport(anchor, allBricks);

  while (support) {
    anchor = support;
    support = findDirectSupport(anchor, allBricks);
  }

  return anchor;
};

/**
 * All bricks stacked above `anchor` (transitive).
 * @param {import('three').Object3D} anchor
 * @param {import('three').Object3D[]} allBricks
 */
export const getBricksStackedAbove = (anchor, allBricks) => {
  const above = new Set();
  const queue = [anchor];

  while (queue.length > 0) {
    const current = queue.pop();
    allBricks.forEach((candidate) => {
      if (candidate === anchor || candidate === current || above.has(candidate)) {
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
 * Anchor + every brick stacked on it — the group to move together.
 * @param {import('three').Object3D} hitBrick
 * @param {import('three').Object3D[]} allBricks
 */
export const getBrickMoveGroup = (hitBrick, allBricks) => {
  const anchor = findStackAnchor(hitBrick, allBricks);
  return [anchor, ...getBricksStackedAbove(anchor, allBricks)];
};