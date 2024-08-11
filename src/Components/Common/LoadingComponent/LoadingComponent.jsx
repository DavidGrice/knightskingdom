import React, { useEffect, useRef } from 'react';
import styles from './LoadingComponent.module.css';

const LoadingComponent = ({ isLoading }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isLoading) {
        videoRef.current.play().catch(error => {
          console.error('Error attempting to play the video:', error);
        });
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reset to start
      }
    }
  }, [isLoading]);

  const handleVideoError = (event) => {
    console.error('Error loading video:', event);
  };

  return (
    <div className={styles.mainDiv}>
      <video ref={videoRef} width="120" height="120" loop muted onError={handleVideoError}>
        <source src="lego_clock.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
    
  );
};

export default LoadingComponent;