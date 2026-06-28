import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import stackStyles from './FrameAnimator.module.css';

const DEFAULT_INTERVAL_MS = 50;

const preloadImage = (src) => new Promise((resolve) => {
  if (!src) {
    resolve();
    return;
  }
  const img = new Image();
  img.onload = () => resolve();
  img.onerror = () => resolve();
  img.src = src;
});

const FrameAnimator = ({
  backgroundImage,
  placeholderImage,
  frames = [],
  frameIntervalMs = DEFAULT_INTERVAL_MS,
  wrapperClassName = '',
  frameClassName = '',
}) => {
  const stackRef = useRef(null);
  const timerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [ready, setReady] = useState(false);

  const animationFrames = useMemo(() => {
    if (frames.length > 0) {
      return frames;
    }
    return placeholderImage ? [placeholderImage] : [];
  }, [frames, placeholderImage]);

  const sources = useMemo(
    () => [...new Set([placeholderImage, ...animationFrames].filter(Boolean))],
    [placeholderImage, animationFrames],
  );

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    Promise.all(sources.map(preloadImage)).then(() => {
      if (!cancelled) {
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [sources]);

  const stopAnimation = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsHovering(false);
    setFrameIndex(0);
  }, []);

  const startAnimation = useCallback(() => {
    if (!ready || animationFrames.length < 2) {
      return;
    }
    setIsHovering(true);
    setFrameIndex(0);
    timerRef.current = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % animationFrames.length);
    }, frameIntervalMs);
  }, [ready, animationFrames.length, frameIntervalMs]);

  useEffect(() => {
    const el = stackRef.current;
    if (!el) {
      return undefined;
    }

    el.addEventListener('mouseenter', startAnimation);
    el.addEventListener('mouseleave', stopAnimation);
    return () => {
      el.removeEventListener('mouseenter', startAnimation);
      el.removeEventListener('mouseleave', stopAnimation);
      stopAnimation();
    };
  }, [startAnimation, stopAnimation]);

  const wrapperStyle = backgroundImage
    ? { backgroundImage: `url(${JSON.stringify(backgroundImage)})` }
    : undefined;

  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <div
        ref={stackRef}
        className={`${stackStyles.frameStack} ${frameClassName}`.trim()}
      >
        {sources.map((src) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            draggable={false}
            className={stackStyles.frameImg}
            style={{
              opacity: !isHovering
                ? (src === placeholderImage ? 1 : 0)
                : (animationFrames[frameIndex] === src ? 1 : 0),
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FrameAnimator;