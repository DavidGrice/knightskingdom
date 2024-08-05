import React, { useEffect, useRef, useState } from 'react';
import styles from './MainGame.module.css';
import { GameEngine, ComponentTop, ComponentBottom } from './index';
import { Bucket } from './ComponentTop/Bucket/index';
import { Palette } from './ComponentTop/Palette/index';
import { Drive } from './ComponentTop/Drive/index';
import { Climate } from './ComponentBottom/Climate/index';
import { Music } from './ComponentBottom/Music/index';


const MainGame = ({ navigateToStartMenu, map }) => {
  const [showBucket, setShowBucket] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isClimateOpen, setIsClimateOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null);

  const handleBucket = () => {
    setShowBucket(!showBucket);
  }

  const handleAction = () => {
    setIsActionOpen(!isActionOpen);
  }

  const handleSave = () => {
    setIsSaveOpen(!isSaveOpen);
  }

  const handlePaintAndDrive = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    if (isFollowing) {
      setIsFollowing(false);
    }
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
    // if (isPaletteOpen) {
    //   setIsPaletteOpen(false);
    // }
    // if (isFollowing) {
    //   setIsFollowing(false);
    // }
    setIsClimateOpen(!isClimateOpen);
  }

  const handleMusic = () => {
    if (isClimateOpen) {
      setIsClimateOpen(false);
    }
    // if (isPaletteOpen) {
    //   setIsPaletteOpen(false);
    // }
    // if (isFollowing) {
    //   setIsFollowing(false);
    // }
    setIsMusicOpen(!isMusicOpen);
  }

  const closeClimate = () => {
    setIsClimateOpen(false);
    setActiveIcon(null);
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
        handlePaintAndDrive={handlePaintAndDrive}
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
      {
        isClimateOpen && (<div>
          <Climate closeClimate={closeClimate} />
        </div>)
      }
      {
        isMusicOpen && (<div>
          <Music />
        </div>)
      }
      
      <GameEngine map={map} />
      <div className={styles.bottomComponent}>
        <ComponentBottom
          handleClimate={handleClimate}
          handleMusic={handleMusic}
          activeIcon={activeIcon}
          setActiveIcon={setActiveIcon}
          />
      </div>
    </div>
  );
}

export default MainGame;