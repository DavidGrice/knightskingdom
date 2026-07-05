'use client';

import React, { useMemo, useRef } from 'react';
import styles from './MenuStageLayout.module.css';
import { menuStageToCssVars, MENU_SCREEN_METRICS } from './menuStageMetrics';
import { MENU_SCALE_MODES } from './menuScaleModes';
import useMenuCanvasScale from './useMenuCanvasScale';

/**
 * Fixed 800×600 letterboxed stage for all bitmap menu screens.
 * @param {object} props
 * @param {string} [props.screenKey] — key into MENU_SCREEN_METRICS (sets CSS vars)
 * @param {'vanilla' | 'modern'} [props.scaleMode] — viewport scale strategy
 * @param {string|import('react').StaticImageData} props.backgroundImage
 * @param {React.ReactNode} props.children
 * @param {string} [props.contentClassName]
 * @param {React.ReactNode} [props.bottomLeft]
 * @param {React.ReactNode} [props.bottomRight]
 * @param {React.ReactNode} [props.topRight]
 */
const MenuStageLayout = ({
  screenKey = null,
  scaleMode: scaleModeProp = null,
  backgroundImage,
  children,
  contentClassName = '',
  bottomLeft = null,
  bottomRight = null,
  topRight = null,
}) => {
  const scalerRef = useRef(null);
  const screenMetrics = screenKey ? MENU_SCREEN_METRICS[screenKey] : null;
  const scaleMode = scaleModeProp
    || screenMetrics?.scaleMode
    || MENU_SCALE_MODES.VANILLA;

  useMenuCanvasScale(scalerRef, scaleMode);

  const stageStyle = useMemo(() => {
    const bgUrl = typeof backgroundImage === 'string'
      ? backgroundImage
      : backgroundImage?.src;
    const vars = screenKey ? menuStageToCssVars(screenKey) : menuStageToCssVars('START_WORLD');
    return {
      ...vars,
      backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
    };
  }, [backgroundImage, screenKey]);

  const rootClass = [
    styles.menuRoot,
    scaleMode === MENU_SCALE_MODES.MODERN ? styles.menuRootModern : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass} data-testid="menu-root" data-scale-mode={scaleMode}>
      <div ref={scalerRef} className={styles.menuScaler} data-testid="menu-scaler">
        <div
          className={styles.stage}
          style={stageStyle}
          data-testid="menu-stage"
          data-screen={screenKey || 'generic'}
        >
          <div className={`${styles.content} ${contentClassName}`.trim()}>
            {children}
          </div>
          {bottomLeft ? (
            <div className={styles.cornerCheckmark} data-testid="menu-corner-checkmark">
              {bottomLeft}
            </div>
          ) : null}
          {bottomRight ? (
            <div className={styles.cornerTrash} data-testid="menu-corner-trash">
              {bottomRight}
            </div>
          ) : null}
          {topRight ? (
            <div className={styles.cornerLeave} data-testid="menu-corner-leave">
              {topRight}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MenuStageLayout;