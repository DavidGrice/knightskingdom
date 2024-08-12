import React, { useEffect, useRef, useState } from 'react';
import styles from './MainGame.module.css';
import { GameEngine, ComponentTop, ComponentBottom } from './index';
import { Bucket } from './ComponentTop/Bucket/index';
import { Palette } from './ComponentTop/Palette/index';
import { Drive } from './ComponentTop/Drive/index';
import { Climate } from './ComponentBottom/Climate/index';
import { Music } from './ComponentBottom/Music/index';

const MainGame = ({ navigateToStartMenu, navigateToWorkshop, navigateToSnapshot, mapData }) => {
  

  const [mode, setMode] = useState('NONE');
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [showBucket, setShowBucket] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [color, setColor] = useState(null);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isClimateOpen, setIsClimateOpen] = useState(false);
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null);
  const [activeWeather, setActiveWeather] = useState(0);
  const [activeMusic, setActiveMusic] = useState(0);
  const [activeCamera, setActiveCamera] = useState(null);

  const handleSave = () => {
    setIsSaveOpen(!isSaveOpen);
  }

  const handleBucket = () => {
    setShowBucket(!showBucket);
  }

  const handleMove = () => {
    setMode('MOVING');
    console.log('Mode set to MOVING');
  }

  const handleRotate = () => {
    setMode('ROTATING');
  }

  const handlePalette = () => {
    setMode('PAINTING');
    if (isFollowing) {
      setIsFollowing(false);
    }
    setIsPaletteOpen(!isPaletteOpen);
  }

  const handleColor = (color) => {
    setColor(color);
  }

  useEffect(() => {
    switch (mode) {
    case 'MOVING':
      console.log('Mode set to MOVING');
      console.log(mode);
      break;
    case 'ROTATING':
      console.log('Mode set to ROTATING');
      console.log(mode);
      break;
    case 'PAINTING':
      console.log('Mode set to PAINTING');
      console.log(mode);
      break;
      case 'DELETING':
      console.log('Mode set to DELETING');
      console.log(mode);
      break;
    case 'ACTION':
      console.log('Mode set to ACTION');
      console.log(mode);
      break;
    case 'DRIVING':
      console.log('Mode set to DRIVING');
      console.log(mode);
      break;
    case 'PLAYING':
      console.log('Mode set to PLAYING');
      console.log(mode);
      break;
    default:
      break;
    }
  }, [mode]);

  const handleDelete = () => {
    setMode('DELETING');
  };

  const handleAction = () => {
    setIsActionOpen(!isActionOpen);
    setMode('ACTION');
  }

  const handleDrive = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    setMode('DRIVING');
    setIsFollowing(!isFollowing);
  }

  const handleCameraSwitch = (type) => {
    if (type === 'back') {
      setActiveCamera('back');
    } else if (type === 'front') {
      setActiveCamera('front');
    };
  }

  const handlePaintAndDrive = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    if (isFollowing) {
      setIsFollowing(false);
    }
  }

  const handlePlay = () => {
    setMode('PLAYING');
  }

  const handleClimate = () => {
    if (isMusicOpen) {
      setIsMusicOpen(false);
    }
    setIsClimateOpen(!isClimateOpen);
  }

  const handleMusic = () => {
    if (isClimateOpen) {
      setIsClimateOpen(false);
    }
    setIsMusicOpen(!isMusicOpen);
  }

  const closeClimate = () => {
    setIsClimateOpen(false);
    setActiveIcon(null);
  }

  const closeMusic = () => {
    setIsMusicOpen(false);
    setActiveIcon(null);
  }

  return (
    <div className={styles.mainDiv}>
      <div className={styles.topComponent}>
        <ComponentTop 
          navigateToStartMenu={navigateToStartMenu}
          handleSave={handleSave}
          handleBucket={handleBucket}
          handleMove={handleMove}
          handleRotate={handleRotate}
          handlePalette={handlePalette}
          handleColor={handleColor}
          handleDelete={handleDelete}
          handleAction={handleAction}
          handleDrive={handleDrive}
          handlePaintAndDrive={handlePaintAndDrive}
          handlePlay={handlePlay}
        />
      </div>
      {showBucket && (
        <div>
          <Bucket />
        </div>
      )}
      {isPaletteOpen && (
        <div>
          <Palette handleColor={handleColor} />
        </div>
      )}
      {isFollowing && (
        <div>
          <Drive
          handleCameraSwitch={handleCameraSwitch}
          />
        </div>
      )}
      {isClimateOpen && (
        <div>
          <Climate
            closeClimate={closeClimate}
            activeWeather={activeWeather}
            setActiveWeather={setActiveWeather}
          />
        </div>
      )}
      {isMusicOpen && (
        <div>
          <Music
            closeMusic={closeMusic}
            activeMusic={activeMusic}
            setActiveMusic={setActiveMusic}
          />
        </div>
      )}
      <GameEngine
        mapData={mapData}
        color={color}
        mode={mode}
        activeCamera={activeCamera}
        isFollowing={isFollowing}
      />
      <div className={styles.bottomComponent}>
        <ComponentBottom
          handleClimate={handleClimate}
          handleMusic={handleMusic}
          activeIcon={activeIcon}
          setActiveIcon={setActiveIcon}
          navigateToWorkshop={navigateToWorkshop}
          navigateToSnapshot={navigateToSnapshot}
        />
      </div>
    </div>
  );
}

export default MainGame;