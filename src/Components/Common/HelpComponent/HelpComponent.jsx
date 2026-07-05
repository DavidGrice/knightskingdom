import React from 'react';
import FrameAnimator from '../FrameAnimator/FrameAnimator';
import styles from './HelpComponent.module.css';

const HelpComponent = ({
  backgroundImage,
  placeholderImage,
  frames = [],
  wrapperClassName = '',
  frameClassName = '',
}) => (
  <FrameAnimator
    backgroundImage={backgroundImage}
    placeholderImage={placeholderImage}
    frames={frames}
    wrapperClassName={`${styles.helpComponent} ${wrapperClassName}`.trim()}
    frameClassName={`${styles.frameDiv} ${frameClassName}`.trim()}
  />
);

export default HelpComponent;