import React, { useEffect, useRef } from 'react';
import styles from './LoadingComponent.module.css';

const LoadingComponent = ({ isLoading }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isLoading) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reset to start
      }
    }
  }, [isLoading]);

  return (
    <video ref={videoRef} width="120" height="120" loop muted>
      <source src="loading_animation.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default LoadingComponent;
