import React from 'react';
import styles from './MenuScreenLayout.module.css';

const MenuScreenLayout = ({
  backgroundImage,
  children,
  contentClassName = '',
  bottomLeft = null,
  bottomRight = null,
  topRight = null,
}) => (
  <div
    className={styles.screen}
    style={{ backgroundImage: `url(${backgroundImage})` }}
  >
    <div className={`${styles.content} ${contentClassName}`.trim()}>{children}</div>
    {bottomLeft ? <div className={styles.bottomLeftCorner}>{bottomLeft}</div> : null}
    {bottomRight ? <div className={styles.bottomRightCorner}>{bottomRight}</div> : null}
    {topRight ? <div className={styles.topRightCorner}>{topRight}</div> : null}
  </div>
);

export default MenuScreenLayout;