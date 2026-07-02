import React, { useState } from 'react';
import styles from './Start.module.css';
import { World } from '..';
import { BackCheckmarkButton, IconComponent, MenuScreenLayout } from '../../../Common';
import { leaveIcon } from './StartResourceStack/index';
import startBackground from './StartResourceStack/background.png';

const Start = ({ navigateToMenu, navigateToMainGame }) => {
  const [worldData, setWorldData] = useState(null);

  const handleCheckmarkClick = () => {
    if (!worldData || worldData.isLocked) {
      return;
    }
    navigateToMainGame(worldData);
  };

  return (
    <MenuScreenLayout
      backgroundImage={startBackground}
      contentClassName={styles.centeredContainer}
      bottomLeft={<BackCheckmarkButton onClick={handleCheckmarkClick} />}
    >
      <div className={styles.topRightCorner} onClick={navigateToMenu}>
        <div className={styles.leaveIconHolder}>
          <IconComponent
            type="leave"
            placeholderImage={leaveIcon.placeholderIcon}
            frames={leaveIcon.startFrames}
          />
        </div>
      </div>
      <World setWorldData={setWorldData} />
    </MenuScreenLayout>
  );
};

export default Start;