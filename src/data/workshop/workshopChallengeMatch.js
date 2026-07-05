/**
 * Compare player brick layout against a challenge target (position-tolerant).
 */

const POS_TOLERANCE = 0.45;
const COLOR_OPTIONAL = true;

/** @param {BrickInstance} a @param {BrickInstance} b */
const instancesMatch = (a, b) => {
  if (a.brickId !== b.brickId) {
    return false;
  }
  if (!COLOR_OPTIONAL && a.color && b.color && a.color !== b.color) {
    return false;
  }
  const dx = Math.abs((a.position?.x ?? 0) - (b.position?.x ?? 0));
  const dy = Math.abs((a.position?.y ?? 0) - (b.position?.y ?? 0));
  const dz = Math.abs((a.position?.z ?? 0) - (b.position?.z ?? 0));
  return dx <= POS_TOLERANCE && dy <= POS_TOLERANCE && dz <= POS_TOLERANCE;
};

/**
 * Greedy match: each target brick must pair with a distinct player brick.
 * @param {BrickInstance[]} player
 * @param {BrickInstance[]} target
 */
export const evaluateChallengeMatch = (player = [], target = []) => {
  if (!target.length) {
    return { matched: 0, total: 0, complete: true };
  }

  const pool = [...player];
  let matched = 0;

  for (const goal of target) {
    const idx = pool.findIndex((p) => instancesMatch(p, goal));
    if (idx >= 0) {
      matched += 1;
      pool.splice(idx, 1);
    }
  }

  return {
    matched,
    total: target.length,
    complete: matched === target.length,
  };
};