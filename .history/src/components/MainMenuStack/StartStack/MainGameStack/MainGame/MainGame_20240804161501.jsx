import React, { useEffect, useRef, useState } from 'react';
import styles from './MainGame.module.css';
import { GameEngine, ComponentTop, ComponentBottom } from './index';
import { Bucket } from './ComponentTop/Bucket/index';
import { Palette } from './ComponentTop/Palette/index';
import { Drive } from './ComponentTop/Drive/index';


const MainGame = ({ navigateToStartMenu, map }) => {
  const [showBucket, setShowBucket] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const handleBucket = () => {
    setShowBucket(!showBucket);
  }

  const handleAction = () => {
    setIsActionOpen(!isActionOpen);
  }

  const handlePalette = () => {
    if (isFollowing) {
      setIsFollowing(false);
    }
    setIsPaletteOpen(!isPaletteOpen);
  }

  const handleDrive = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    setIsFollowing(!isFollowing);
  }
  

  return (
    <div className={styles.mainDiv}>
      <div className={styles.topComponent}>
        <ComponentTop navigateToStartMenu={navigateToStartMenu} 
        handleBucket={handleBucket}
        showBucket={showBucket}
        handlePalette={handlePalette}
        showPalette={isPaletteOpen}
        handleDrive={handleDrive}
        isFollowing={isFollowing}
        />
      </div>
      {
      showBucket && (<div>
        <Bucket />
      </div>)
      }
      {
      isPaletteOpen && (<div>
        <Palette />
      </div>)
      }
      {
        isFollowing && (<div>
          <Drive />
        </div>)
      }
      
      <GameEngine map={map} />
      <div className={styles.bottomComponent}>
        <ComponentBottom />
      </div>
    </div>
  );
}

export default MainGame;