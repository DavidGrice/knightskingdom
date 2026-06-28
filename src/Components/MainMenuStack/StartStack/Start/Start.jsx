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
      topRight={
        <div onClick={navigateToMenu}>
          <IconComponent
            type="leave"
            placeholderImage={leaveIcon.placeholderIcon}
            frames={leaveIcon.startFrames}
          />
        </div>
      }
    >
      <World setWorldData={setWorldData} />
    </MenuScreenLayout>
  );
};

export default Start;