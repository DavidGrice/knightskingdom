'use client';

import React from 'react';
import styles from './MenuPanelShell.module.css';
import { getHolderMetricsForScreen } from './menuStageMetrics';

/**
 * Standardized holder panel shell for grid menus.
 *
 * archetype SINGLE_HEADER — SnapShot, MyModels (one frame, no tabs)
 * archetype DUAL_HEADER   — World picker (tab strip + light/dark holder)
 *
 * @param {object} props
 * @param {'SINGLE_HEADER' | 'DUAL_HEADER'} props.archetype
 * @param {string} props.screenKey — MENU_SCREEN_METRICS key
 * @param {string} [props.holderBackground] — holder frame PNG url
 * @param {React.ReactNode} [props.header] — tab strip (DUAL_HEADER only)
 * @param {React.ReactNode} props.children — PaginatedGrid body
 */
const MenuPanelShell = ({
  archetype,
  screenKey,
  holderBackground = null,
  header = null,
  children,
}) => {
  const holder = getHolderMetricsForScreen(screenKey);
  const shellStyle = holder
    ? {
        width: `${holder.bodyWidth}px`,
        ...(holderBackground ? { backgroundImage: `url(${holderBackground})` } : {}),
      }
    : undefined;

  return (
    <div
      className={styles.panelRoot}
      data-testid="menu-panel-shell"
      data-archetype={archetype}
      data-screen={screenKey}
    >
      {archetype === 'DUAL_HEADER' && header ? (
        <div className={styles.dualHeader} data-testid="menu-panel-dual-header">
          {header}
        </div>
      ) : null}
      <div
        className={[
          styles.holder,
          archetype === 'DUAL_HEADER' ? styles.holderDual : styles.holderSingle,
        ].join(' ')}
        style={shellStyle}
        data-testid="menu-panel-holder"
      >
        {children}
      </div>
    </div>
  );
};

export default MenuPanelShell;