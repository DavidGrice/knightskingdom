import React from 'react';
import FrameAnimator from '../FrameAnimator/FrameAnimator';
import styles from './IconComponent.module.css';

const IconComponent = ({
  type: _type,
  backgroundImage,
  placeholderImage,
  frames = [],
}) => (
  <FrameAnimator
    backgroundImage={backgroundImage}
    placeholderImage={placeholderImage}
    frames={frames}
    wrapperClassName={styles.iconComponent}
    frameClassName={styles.frameDiv}
  />
);

export default IconComponent;