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
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isClimateOpen, setIsClimateOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);

  const handleBucket = () => {
    setShowBucket(!showBucket);
  }

  const handleAction = () => {
    setIsActionOpen(!isActionOpen);
  }

  const handleSave = () => {
    setIsSaveOpen(!isSaveOpen);
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

  const handleClimate = () => {
    if (isMusicOpen) {
      setIsMusicOpen(false);
    }
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    if (isFollowing) {
      setIsFollowing(false);
    }
    setIsClimateOpen(!isClimateOpen);
  }

  const handleMusic = () => {
    if (isClimateOpen) {
      setIsClimateOpen(false);
    }
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    if (isFollowing) {
      setIsFollowing(false);
    }
    setIsMusicOpen(!isMusicOpen);
  }
  

  return (
    <div className={styles.mainDiv}>
      <div className={styles.topComponent}>
        <ComponentTop navigateToStartMenu={navigateToStartMenu} 
        handleBucket={handleBucket}
        handlePalette={handlePalette}
        handleDrive={handleDrive}
        handleAction={handleAction}
        handleSave={handleSave}
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
        <ComponentBottom  />
      </div>
    </div>
  );
}

export default MainGame;