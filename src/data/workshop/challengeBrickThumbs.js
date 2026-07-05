import Brick2x4 from '@/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/challenges/c5_bricks1/c5_2x4.png';
import BrickDoor from '@/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/challenges/c5_bricks2/c5_door.png';
import BrickWindow from '@/Components/MainMenuStack/StartStack/MainGameStack/WorkShop/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/challenges/c5_bricks2/c5_window.png';

/** Bucket PNG thumbnails for D5 challenge / instruction previews. */
export const CHALLENGE_BRICK_THUMBS = {
  c5_2x4: Brick2x4,
  c5_door: BrickDoor,
  c5_window: BrickWindow,
};

/** @param {string | undefined} brickId */
export const getChallengeBrickThumb = (brickId) => (
  brickId ? CHALLENGE_BRICK_THUMBS[brickId] ?? null : null
);