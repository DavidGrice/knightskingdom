import React, { useState, useEffect } from 'react';
import styles from './HelpComponent.module.css';

const bgStyle = (image) => (image ? { backgroundImage: `url(${image})` } : undefined);

const HelpComponent = ({ backgroundImage, placeholderImage, frames = [] }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameImage =
    currentFrame === 0 ? placeholderImage : frames[currentFrame] || placeholderImage;

  useEffect(() => {
    let timer;
    const element = document.getElementById('help-component');
    if (!element) {
      return undefined;
    }

    const handleMouseEnter = () => {
      if (frames.length < 2) {
        return;
      }
      timer = setInterval(() => {
        setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
      }, 50);
    };

    const handleMouseLeave = () => {
      clearInterval(timer);
      setCurrentFrame(0);
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(timer);
    };
  }, [frames.length]);

  return (
    <div className={styles.helpComponent} style={bgStyle(backgroundImage)}>
      <div
        id="help-component"
        className={styles.frameDiv}
        style={bgStyle(frameImage)}
      />
    </div>
  );
};

export default HelpComponent;