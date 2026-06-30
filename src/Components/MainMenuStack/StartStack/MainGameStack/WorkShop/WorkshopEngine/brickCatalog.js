import { BRICK_HEIGHT, PLATE_HEIGHT } from './studGrid';

/** @typedef {'BOX' | 'PLATE' | 'SLOPE' | 'CYLINDER' | 'GLB'} BrickShape */

/**
 * Extract catalog id from bucket modelPath, e.g. `./basic/00_l300500` → `l300500`.
 * @param {string | undefined} modelPath
 */
export const extractBrickId = (modelPath) => {
  if (!modelPath) {
    return null;
  }
  const match = modelPath.match(/l(\d+)/i);
  return match ? `l${match[1]}` : null;
};

/**
 * Starter catalog — parametric recipes keyed by brick id from bucket filenames.
 * Unknown ids fall back to DEFAULT_BRICK_RECIPE in BrickFactory.
 * Optional GLB: set shape to 'GLB' and glbUrl under `/workshop/bricks/<id>.glb`.
 */
export const BRICK_CATALOG = {
  l300500: { name: 'Brick 2×4', shape: 'BOX', studs: { w: 2, d: 4 }, heightPlates: 3 },
  l245300: { name: 'Brick 2×3', shape: 'BOX', studs: { w: 2, d: 3 }, heightPlates: 3 },
  l300400: { name: 'Brick 2×2', shape: 'BOX', studs: { w: 2, d: 2 }, heightPlates: 3 },
  l324500: { name: 'Brick 1×4', shape: 'BOX', studs: { w: 1, d: 4 }, heightPlates: 3 },
  l245400: { name: 'Brick 1×2', shape: 'BOX', studs: { w: 1, d: 2 }, heightPlates: 3 },
  l362200: { name: 'Brick 1×1', shape: 'BOX', studs: { w: 1, d: 1 }, heightPlates: 3 },
  l301000: { name: 'Plate 2×4', shape: 'PLATE', studs: { w: 2, d: 4 }, heightPlates: 1 },
  l300900: { name: 'Plate 2×2', shape: 'PLATE', studs: { w: 2, d: 2 }, heightPlates: 1 },
  l375400: { name: 'Plate 1×4', shape: 'PLATE', studs: { w: 1, d: 4 }, heightPlates: 1 },
  l300800: { name: 'Plate 1×2', shape: 'PLATE', studs: { w: 1, d: 2 }, heightPlates: 1 },
  l611100: { name: 'Plate 1×1', shape: 'PLATE', studs: { w: 1, d: 1 }, heightPlates: 1 },
  l611200: { name: 'Brick 2×6', shape: 'BOX', studs: { w: 2, d: 6 }, heightPlates: 3 },
  l307000: { name: 'Tile 1×1', shape: 'PLATE', studs: { w: 1, d: 1 }, heightPlates: 1, showStuds: false },
};

export const DEFAULT_BRICK_RECIPE = {
  name: 'Brick 2×2',
  shape: 'BOX',
  studs: { w: 2, d: 2 },
  heightPlates: 3,
};

/**
 * @param {string | null | undefined} brickId
 */
export const resolveBrickRecipe = (brickId) => {
  if (!brickId) {
    return DEFAULT_BRICK_RECIPE;
  }
  return BRICK_CATALOG[brickId] || DEFAULT_BRICK_RECIPE;
};

/**
 * @param {{ studs: { w: number, d: number }, heightPlates: number, shape?: BrickShape }} recipe
 */
export const recipeHeight = (recipe) => {
  if (recipe.shape === 'PLATE' || recipe.heightPlates === 1) {
    return PLATE_HEIGHT;
  }
  return BRICK_HEIGHT;
};