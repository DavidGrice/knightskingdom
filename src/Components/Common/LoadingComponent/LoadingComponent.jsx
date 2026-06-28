import React, { useEffect, useRef } from 'react';
import styles from './LoadingComponent.module.css';
import legoClockVideo from './LoadingComponentResourceStack/lego_clock.mp4';

const isBenignPlaybackError = (error) =>
  error?.name === 'AbortError'
  || error?.name === 'NotAllowedError';

const LoadingComponent = ({ isLoading = true }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return undefined;
    }

    if (isLoading) {
      const playAttempt = video.play();
      if (playAttempt?.catch) {
        playAttempt.catch((error) => {
          if (!isBenignPlaybackError(error)) {
            console.warn('Loading video playback failed:', error);
          }
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      video.pause();
    };
  }, [isLoading]);

  const handleVideoError = () => {
    console.warn('Loading video failed to load:', legoClockVideo);
  };

  return (
    <div className={styles.videoWrapper}>
      <video
        ref={videoRef}
        width="120"
        height="120"
        loop
        muted
        playsInline
        onError={handleVideoError}
      >
        <source src={legoClockVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default LoadingComponent;