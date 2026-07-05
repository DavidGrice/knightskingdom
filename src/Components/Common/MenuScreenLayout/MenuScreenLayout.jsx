import React from 'react';
import MenuStageLayout from '../MenuStageLayout/MenuStageLayout';

/**
 * Full-screen menu shell — delegates to MenuStageLayout (800×600 letterbox).
 * @param {string} [screenKey] — MENU_SCREEN_METRICS key for corner/holder CSS vars
 */
const MenuScreenLayout = ({
  backgroundImage,
  children,
  contentClassName = '',
  screenKey = null,
  bottomLeft = null,
  bottomRight = null,
  topRight = null,
}) => (
  <MenuStageLayout
    screenKey={screenKey}
    backgroundImage={backgroundImage}
    contentClassName={contentClassName}
    bottomLeft={bottomLeft}
    bottomRight={bottomRight}
    topRight={topRight}
  >
    {children}
  </MenuStageLayout>
);

export default MenuScreenLayout;