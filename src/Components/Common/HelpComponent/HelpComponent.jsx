import React from 'react';
import FrameAnimator from '../FrameAnimator/FrameAnimator';
import styles from './HelpComponent.module.css';

const HelpComponent = ({ backgroundImage, placeholderImage, frames = [] }) => (
  <FrameAnimator
    backgroundImage={backgroundImage}
    placeholderImage={placeholderImage}
    frames={frames}
    wrapperClassName={styles.helpComponent}
    frameClassName={styles.frameDiv}
  />
);

export default HelpComponent;