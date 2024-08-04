import React, { useEffect, useRef, useState } from 'react';
import styles from './MainGame.module.css';
import { GameEngine, ComponentTop, ComponentBottom } from './index';
import { Bucket, Palette } from './ComponentTop/Bucket/index';


const MainGame = ({ navigateToStartMenu, map }) => {
  const [showBucket, setShowBucket] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleBucket = () => {
    setShowBucket(!showBucket);
  }

  const handlePalette = () => {
    setIsPaletteOpen(!isPaletteOpen);
  }

  const handleDrive = () => {
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
      showBucket && (<div className={styles.leftComponent}>
        <Bucket />
      </div>)
      }
      {
      isPaletteOpen && (<div className={styles.rightComponent}>
        <Palette />
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