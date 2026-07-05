import { MENU_CANVAS } from './menuStageMetrics';

/**
 * How the 800×600 menu stage maps to the viewport.
 *
 * vanilla — pixel-faithful letterbox (original game fidelity)
 * modern  — roomier layout: slightly larger scale, centered stacks, breathing gaps
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
  const margin = 24;

  if (mode === MENU_SCALE_MODES.MODERN) {
    // Use more of the viewport height so profile rows are not crushed at the bottom.
    // Slightly wider effective canvas (820) gives a less "squished" feel on 16:9 displays.
    const effectiveW = 800;
    const effectiveH = 620;
    const scale = Math.min(
      (viewportWidth - margin * 2) / effectiveW,
      (viewportHeight - margin * 2) / effectiveH,
    );
    return Math.max(0.85, Math.min(scale, 1.65));
  }

  const scale = Math.min(
    viewportWidth / CW,
    viewportHeight / CH,
  );
  return Math.max(0.5, scale);
};