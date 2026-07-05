import { useLayoutEffect } from 'react';
import { computeMenuScale, MENU_SCALE_MODES } from './menuScaleModes';

/**
 * Scale the fixed 800×600 menu canvas to fit the viewport.
 * @param {React.RefObject<HTMLElement>} scalerRef
 * @param {'vanilla' | 'modern'} [scaleMode]
 */
const useMenuCanvasScale = (scalerRef, scaleMode = MENU_SCALE_MODES.VANILLA) => {
  useLayoutEffect(() => {
    const node = scalerRef.current;
    if (!node) {
      return undefined;
    }

    const updateScale = () => {
      const scale = computeMenuScale(
        scaleMode,
        window.innerWidth,
        window.innerHeight,
      );
      node.style.setProperty('--msl-scale', String(scale));
      node.dataset.scaleMode = scaleMode;
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [scalerRef, scaleMode]);
};

export default useMenuCanvasScale;