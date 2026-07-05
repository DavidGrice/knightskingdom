import { useLayoutEffect } from 'react';
import { MENU_CANVAS } from './menuStageMetrics';

/**
 * Scale the fixed 800×600 menu canvas to fit the viewport (letterboxed via transform).
 * @param {React.RefObject<HTMLElement>} scalerRef
 */
const useMenuCanvasScale = (scalerRef) => {
  useLayoutEffect(() => {
    const node = scalerRef.current;
    if (!node) {
      return undefined;
    }

    const updateScale = () => {
      const scale = Math.min(
        window.innerWidth / MENU_CANVAS.width,
        window.innerHeight / MENU_CANVAS.height,
      );
      node.style.setProperty('--msl-scale', String(scale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [scalerRef]);
};

export default useMenuCanvasScale;