import { MENU_CANVAS } from './menuStageMetrics';

/**
 * vanilla — strict 800×600 letterbox (world picker, save, photo)
 * modern — same scale math as vanilla; "modern" only affects layout vars (gaps, anchors)
 *          not a larger/cover scale that clips the stage
 */
export const MENU_SCALE_MODES = {
  VANILLA: 'vanilla',
  MODERN: 'modern',
};

const { width: CW, height: CH } = MENU_CANVAS;

/**
 * @param {'vanilla' | 'modern'} mode
 * @param {number} viewportWidth
 * @param {number} viewportHeight
 */
export const computeMenuScale = (mode, viewportWidth, viewportHeight) => {
  const margin = 16;
  const scale = Math.min(
    (viewportWidth - margin * 2) / CW,
    (viewportHeight - margin * 2) / CH,
  );
  return Math.max(0.5, Math.min(scale, 2));
};