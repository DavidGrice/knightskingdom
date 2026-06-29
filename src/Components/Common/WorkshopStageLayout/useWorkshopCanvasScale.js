import { useLayoutEffect } from 'react';
import { WORKSHOP_CANVAS } from './workshopStageMetrics';

/**
 * Scale the fixed 800×600 workshop canvas to fit the viewport (letterboxed via transform).
 * @param {React.RefObject<HTMLElement>} scalerRef
 */
const useWorkshopCanvasScale = (scalerRef) => {
  useLayoutEffect(() => {
    const node = scalerRef.current;
    if (!node) {
      return undefined;
    }

    const updateScale = () => {
      const scale = Math.min(
        window.innerWidth / WORKSHOP_CANVAS.width,
        window.innerHeight / WORKSHOP_CANVAS.height,
      );
      node.style.setProperty('--wsl-scale', String(scale));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [scalerRef]);
};

export default useWorkshopCanvasScale;