import { BRICK_HEIGHT, PLATE_HEIGHT } from './studGrid';
import { GENERATED_BRICK_CATALOG } from './brickCatalog.generated';

/** @typedef {'BOX' | 'PLATE' | 'TILE' | 'SLOPE' | 'CYLINDER' | 'ARCH' | 'COMPOSITE' | 'GLB'} BrickShape */

/**
 * Extract catalog id from bucket modelPath.
 * `./basic/00_l300500` → `l300500`; `./challenges/.../c5_2x4` → `c5_2x4`
 * @param {string | undefined} modelPath
 */
export const extractBrickId = (modelPath) => {
  if (!modelPath) {
    return null;
  }
  const lMatch = modelPath.match(/l(\d+)/i);
  if (lMatch) {
    return `l${lMatch[1]}`;
  }
  const slug = modelPath.split('/').pop();
  return slug || null;
};

export const BRICK_CATALOG = {
  ...GENERATED_BRICK_CATALOG,
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
 * @param {{ studs: { w: number, d: number }, heightPlates?: number, shape?: BrickShape }} recipe
 */
export const recipeHeight = (recipe) => {
  const plates = recipe.heightPlates ?? 3;
  if (recipe.shape === 'BOX' && plates === 3) {
    return BRICK_HEIGHT;
  }
  return PLATE_HEIGHT * plates;
};

export const catalogEntryCount = () => Object.keys(BRICK_CATALOG).length;