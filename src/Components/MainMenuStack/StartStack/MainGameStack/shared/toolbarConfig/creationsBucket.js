import Challenge1 from '../../MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/challenges/c2_bricks1/c2_wall.png';
import { toCreationModelId } from '@/api/customCreations';

/**
 * Main-game bucket tab index for workshop exports (original game slot).
 * 3×2 grid: index 5 = bottom-right — challenges_2 / challenges_5 tab icon
 * (hand holding LEGO brick).
 */
export const GAME_CREATIONS_TAB_INDEX = 5;

const FALLBACK_THUMB = Challenge1;

/**
 * @param {Record<string, { id: string, name?: string, thumbnail?: string | null }>} customCreations
 * @returns {Array | null}
 */
export const buildCreationsBucketItems = (customCreations = {}) => {
  const entries = Object.values(customCreations)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime()
      - new Date(a.updatedAt || a.createdAt).getTime());

  if (!entries.length) {
    return null;
  }

  return entries.map((creation) => ({
    name: `Creation_${creation.id}`,
    image: creation.thumbnail || FALLBACK_THUMB,
    SelectedModel: toCreationModelId(creation.id),
    creationId: creation.id,
  }));
};

/**
 * Inject saved creations into the original game bucket tab (hand+brick icon).
 * Replaces challenges tab content when the player has workshop exports.
 *
 * @param {object} baseConfig - from getBucketConfig('models')
 * @param {Record<string, object>} customCreations
 */
export const mergeCreationsIntoGameBucket = (baseConfig, customCreations = {}) => {
  const items = buildCreationsBucketItems(customCreations);
  if (!items?.length) {
    return baseConfig;
  }

  const tabData = [...baseConfig.tabData];
  tabData[GAME_CREATIONS_TAB_INDEX] = items;

  return {
    ...baseConfig,
    tabData,
  };
};