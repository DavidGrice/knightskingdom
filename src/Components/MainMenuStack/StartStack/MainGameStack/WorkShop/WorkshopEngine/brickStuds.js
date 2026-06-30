import { resolveBrickRecipe, recipeHeight } from './brickCatalog';
import { getOrientedStuds } from './brickCollision';
import { EXPORT_HALF, snapYToHeight, STUD } from './studGrid';

const STUD_MATCH_EPS = 1e-3;

/**
 * Local stud offsets from brick center for a w×d footprint.
 * @param {number} w
 * @param {number} d
 */
export const getStudOffsets = (w, d) => {
  const offsets = [];
  for (let sx = 0; sx < w; sx += 1) {
    for (let sz = 0; sz < d; sz += 1) {
      offsets.push({
        x: (sx - (w - 1) / 2) * STUD,
        z: (sz - (d - 1) / 2) * STUD,
      });
    }
  }
  return offsets;
};

/**
 * World XZ of each top stud on `brick` (rotation-aware footprint).
 * @param {import('three').Object3D} brick
 */
export const getBrickTopStudPositions = (brick) => {
  const { w, d } = getOrientedStuds(brick);
  return getStudOffsets(w, d).map((offset) => ({
    x: brick.position.x + offset.x,
    z: brick.position.z + offset.z,
  }));
};

const studMatches = (a, b) =>
  Math.abs(a.x - b.x) < STUD_MATCH_EPS && Math.abs(a.z - b.z) < STUD_MATCH_EPS;

/**
 * @param {{ x: number, z: number }[]} baseStudPositions
 * @param {number} newW
 * @param {number} newD
 * @param {number} cx
 * @param {number} cz
 */
export const isValidStackCenter = (baseStudPositions, newW, newD, cx, cz) => {
  const newOffsets = getStudOffsets(newW, newD);
  return newOffsets.every((offset) =>
    baseStudPositions.some((baseStud) =>
      studMatches(baseStud, { x: cx + offset.x, z: cz + offset.z }),
    ),
  );
};

/**
 * Footprint w×d from recipe with optional Y rotation.
 * @param {{ studs: { w: number, d: number } }} recipe
 * @param {number} [rotationY]
 */
export const getRecipeStudFootprint = (recipe, rotationY = 0) => {
  const quarterTurns = ((Math.round(rotationY / (Math.PI / 2)) % 4) + 4) % 4;
  const swapped = quarterTurns % 2 === 1;
  return {
    w: swapped ? recipe.studs.d : recipe.studs.w,
    d: swapped ? recipe.studs.w : recipe.studs.d,
  };
};

const footprintWithinExportBounds = (cx, cz, w, d) => {
  const halfW = (w * STUD) / 2;
  const halfD = (d * STUD) / 2;
  return Math.abs(cx) + halfW <= EXPORT_HALF + STUD_MATCH_EPS
    && Math.abs(cz) + halfD <= EXPORT_HALF + STUD_MATCH_EPS;
};

/**
 * Every center where `newBrickId` can sit on top of `baseBrick`.
 * @param {import('three').Object3D} baseBrick
 * @param {string} newBrickId
 * @param {number} [rotationY]
 */
export const findValidStackCenters = (baseBrick, newBrickId, rotationY = 0) => {
  const baseStuds = getBrickTopStudPositions(baseBrick);
  const newRecipe = resolveBrickRecipe(newBrickId);
  const { w: newW, d: newD } = getRecipeStudFootprint(newRecipe, rotationY);
  const newOffsets = getStudOffsets(newW, newD);
  const centers = new Map();

  baseStuds.forEach((baseStud) => {
    newOffsets.forEach((offset) => {
      const cx = baseStud.x - offset.x;
      const cz = baseStud.z - offset.z;
      const key = `${cx.toFixed(4)},${cz.toFixed(4)}`;

      if (
        !centers.has(key)
        && isValidStackCenter(baseStuds, newW, newD, cx, cz)
        && footprintWithinExportBounds(cx, cz, newW, newD)
      ) {
        centers.set(key, { x: cx, z: cz });
      }
    });
  });

  return [...centers.values()];
};

/**
 * Pick the valid stack center nearest the click point on the base brick.
 * @param {import('three').Object3D} baseBrick
 * @param {string} newBrickId
 * @param {{ x?: number, y?: number, z?: number } | null} [hitPoint]
 */
export const resolveStackPlacement = (baseBrick, newBrickId, hitPoint = null) => {
  if (!baseBrick?.isBrick || !newBrickId) {
    return null;
  }

  const baseRecipe = resolveBrickRecipe(baseBrick.userData.brickId);
  const newRecipe = resolveBrickRecipe(newBrickId);
  const stackY = baseBrick.position.y + recipeHeight(baseRecipe);
  const y = snapYToHeight(stackY, recipeHeight(newRecipe));

  const candidates = findValidStackCenters(baseBrick, newBrickId);
  if (candidates.length === 0) {
    return null;
  }

  const hx = hitPoint?.x ?? baseBrick.position.x;
  const hz = hitPoint?.z ?? baseBrick.position.z;

  let best = null;
  let bestDist = Infinity;

  candidates.forEach((candidate) => {
    const dist = (candidate.x - hx) ** 2 + (candidate.z - hz) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = { x: candidate.x, y, z: candidate.z };
    }
  });

  return best;
};