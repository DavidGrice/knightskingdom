import Building2 from '../../MainGame/ComponentTop/Bucket/BucketTop/BucketTopResourceStack/buildings_2.png';
import Building5 from '../../MainGame/ComponentTop/Bucket/BucketTop/BucketTopResourceStack/buildings_5.png';
import { toCreationModelId } from '@/api/customCreations';

const creationsTabIcon = {
  passive: Building2,
  active: Building5,
};

const FALLBACK_THUMB = Building2;

/**
 * @param {Record<string, { id: string, name?: string, thumbnail?: string | null }>} customCreations
 */
export const buildCreationsBucketTab = (customCreations = {}) => {
  const entries = Object.values(customCreations)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime()
      - new Date(a.updatedAt || a.createdAt).getTime());

  if (!entries.length) {
    return null;
  }

  const items = entries.map((creation) => ({
    name: `Creation_${creation.id}`,
    image: creation.thumbnail || FALLBACK_THUMB,
    SelectedModel: toCreationModelId(creation.id),
    creationId: creation.id,
  }));

  return {
    tabIcon: creationsTabIcon,
    tabData: items,
  };
};