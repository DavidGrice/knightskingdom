import React, { useState } from 'react';
import { GameEngine } from './index';
import { Drive } from './ComponentTop/Drive/index';
import { Climate } from './ComponentBottom/Climate/index';
import { Music } from './ComponentBottom/Music/index';
import { musicTracks } from './MainGameResourceStack/index';
import { Modes } from './GameEngine/GameEngineResourceStack/index';
import { GameShell, ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';

const MainGame = ({ navigateToStartMenu, navigateToWorkshop, navigateToSnapshot, mapData }) => {

  const [mode, setMode] = useState(Modes.NONE);
  const [selectedModelMode, setSelectedModelMode] = useState('NONE');
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
  const [selectedClimateMode, setSelectedClimateMode] = useState('SUNNY');
  const [climateNeedsUpdating, setClimateNeedsUpdating] = useState(false);
  const [activeMusic, setActiveMusic] = useState(0);
  const [selectedMusic, setSelectedMusic] = useState('NONE');
  const [audio, setAudio] = useState(null);
  const [activeCamera, setActiveCamera] = useState(null);
  const [cameraNeedsReset, setCameraNeedsReset] = useState(false);
  const [intermediateMapData, setIntermediateMapData] = useState(null);

  const resetModes = () => {
    setMode(Modes.NONE);
    setSelectedModelMode('NONE');
  }

  const handleSave = () => {
    setIsSaveOpen(!isSaveOpen);
    resetModes();
  }

  const handleBucket = () => {
    setShowBucket(!showBucket);
    if (showBucket === false) {
      resetModes();
    }
  }

  const handleLoadModel = (model) => {
    setSelectedModelMode(model);
    setMode(Modes.ADDING);
  }

  const handleMove = () => {
    setMode(Modes.MOVING);
    setSelectedModelMode('NONE');
  }

  const handleRotate = () => {
    setMode(Modes.ROTATING);
    setSelectedModelMode('NONE');
  }

  const handlePalette = () => {
    setMode(Modes.PAINTING);
    setSelectedModelMode('NONE');
    if (isFollowing) {
      setIsFollowing(false);
    }
    setIsPaletteOpen(!isPaletteOpen);
  }

  const handleColor = (color) => {
    setColor(color);
    setSelectedModelMode('NONE');
  }

  const handleDelete = () => {
    setMode(Modes.DELETING);
    setSelectedModelMode('NONE');
  };

  const handleAction = () => {
    setIsActionOpen(!isActionOpen);
    setMode(Modes.ACTION);
    setSelectedModelMode('NONE');
  }

  const handleDrive = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    if (showBucket) {
      setShowBucket(false);
    }
    setMode(Modes.DRIVING);
    setIsFollowing(!isFollowing);
    setSelectedModelMode('NONE');
  }

  const handleCameraSwitch = (type) => {
    if (type === 'back') {
      setActiveCamera('back');
    } else if (type === 'front') {
      setActiveCamera('front');
    };
    setSelectedModelMode('NONE');
  }

  const handlePaintAndDrive = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
    if (isFollowing) {
      setIsFollowing(false);
    }
    if (showBucket) {
      setShowBucket(false);
    }
    setSelectedModelMode('NONE');
  }

  const handlePlay = () => {
    setMode(Modes.PLAYING);
    setSelectedModelMode('NONE');
  }

  const handleClimate = () => {
    if (isMusicOpen) {
      setIsMusicOpen(false);
    }
    setIsClimateOpen(!isClimateOpen);
    setSelectedModelMode('NONE');
  }

  const handleWeatherChange = (index) => {
    switch (index) {
      case 0:
        setActiveWeather(0);
        setSelectedClimateMode('SUNNY');
        break;
      case 1:
        setActiveWeather(1);
        setSelectedClimateMode('WINDY');
        break;
      case 2:
        setActiveWeather(2);
        setSelectedClimateMode('FOGGY');
        break;
      case 3:
        setActiveWeather(3);
        setSelectedClimateMode('RAIN');
        break;
      case 4:
        setActiveWeather(4);
        setSelectedClimateMode('SNOW');
        break;
      case 5:
        setActiveWeather(5);
        setSelectedClimateMode('DARK_SUNNY');
        break;
      case 6:
        setActiveWeather(6);
        setSelectedClimateMode('DARK_WINDY');
        break;
      case 7:
        setActiveWeather(7);
        setSelectedClimateMode('DARK_FOGGY');
        break;
      case 8:
        setActiveWeather(8);
        setSelectedClimateMode('DARK_DRIZZLY');
        break;
      case 9:
        setActiveWeather(9);
        setSelectedClimateMode('DARK_THUNDERSTORM');
        break;
      default:
        setActiveWeather(0);
        setSelectedClimateMode('SUNNY');
        break;
    }
    setClimateNeedsUpdating(true);
  }

  const handleMusicChange = (index) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    let newAudio = null;
    switch (index) {
      case 0:
        setActiveMusic(0);
        setSelectedMusic('NONE');
        break;
      case 1:
        setActiveMusic(1);
        setSelectedMusic('GOOD');
        newAudio = new Audio(musicTracks.GOOD);
        break;
      case 2:
        setActiveMusic(2);
        setSelectedMusic('VERYGOOD');
        newAudio = new Audio(musicTracks.VERYGOOD);
        break;
      case 3:
        setActiveMusic(3);
        setSelectedMusic('BAD');
        newAudio = new Audio(musicTracks.BAD);
        break;
      case 4:
        setActiveMusic(4);
        setSelectedMusic('VERYBAD');
        newAudio = new Audio(musicTracks.VERYBAD);
        break;
      default:
        setActiveMusic(0);
        setSelectedMusic('NONE');
        break;
    }

    if (newAudio) {
      newAudio.loop = true;
      newAudio.play();
      setAudio(newAudio);
    }
  };

  const handleMusic = () => {
    if (isClimateOpen) {
      setIsClimateOpen(false);
    }
    setIsMusicOpen(!isMusicOpen);
    setSelectedModelMode('NONE');
  }

  const closeClimate = () => {
    setIsClimateOpen(false);
    setActiveIcon(null);
    setSelectedModelMode('NONE');
  }

  const closeMusic = () => {
    setIsMusicOpen(false);
    setActiveIcon(null);
    setSelectedModelMode('NONE');
  }

  const handleNavigateToWorkshop = () => {
    navigateToWorkshop({
      ...mapData,
      sceneSnapshot: intermediateMapData,
    });
  };

  const handleNavigateToSnapShot = () => {
    if (intermediateMapData === null) {
      return;
    }
    navigateToSnapshot(intermediateMapData);
  };

  return (
    <GameShell
      mode="game"
      top={
        <ComponentTop
          mode="game"
          navigateToStartMenu={navigateToStartMenu}
          handleSave={handleSave}
          handleBucket={handleBucket}
          handleMove={handleMove}
          handleRotate={handleRotate}
          handlePalette={handlePalette}
          handleDelete={handleDelete}
          handleAction={handleAction}
          handleDrive={handleDrive}
          handlePaintAndDrive={handlePaintAndDrive}
          handlePlay={handlePlay}
          resetModes={resetModes}
          setCameraNeedsReset={setCameraNeedsReset}
          handleMusicChange={handleMusicChange}
        />
      }
      bottom={
        <ComponentBottom
          mode="game"
          handleClimate={handleClimate}
          handleMusic={handleMusic}
          activeIcon={activeIcon}
          setActiveIcon={setActiveIcon}
          navigateToWorkshop={handleNavigateToWorkshop}
          handleNavigateToSnapShot={handleNavigateToSnapShot}
          handleMusicChange={handleMusicChange}
        />
      }
    >
      {showBucket && (
        <div>
          <Bucket dataSource="models" handleLoadModel={handleLoadModel} />
        </div>
      )}
      {isPaletteOpen && (
        <div>
          <Palette variant="game" onColorSelect={handleColor} />
        </div>
      )}
      {isFollowing && (
        <div>
          <Drive
          handleCameraSwitch={handleCameraSwitch}
          cameraNeedsReset={cameraNeedsReset}
          setCameraNeedsReset={setCameraNeedsReset}
          />
        </div>
      )}
      {isClimateOpen && (
        <div>
          <Climate
            closeClimate={closeClimate}
            activeWeather={activeWeather}
            setActiveWeather={setActiveWeather}
            selectedClimateMode={selectedClimateMode}
            setSelectedClimateMode={setSelectedClimateMode}
            handleWeatherChange={handleWeatherChange}
          />
        </div>
      )}
      {isMusicOpen && (
        <div>
          <Music
            closeMusic={closeMusic}
            activeMusic={activeMusic}
            setActiveMusic={setActiveMusic}
            handleMusicChange={handleMusicChange}
          />
        </div>
      )}
      <GameEngine
        mapData={mapData}
        color={color}
        mode={mode}
        activeCamera={activeCamera}
        isFollowing={isFollowing}
        addModel={selectedModelMode}
        selectedClimateMode={selectedClimateMode}
        climateNeedsUpdating={climateNeedsUpdating}
        setClimateNeedsUpdating={setClimateNeedsUpdating}
        cameraNeedsReset={cameraNeedsReset}
        setCameraNeedsReset={setCameraNeedsReset}
        isClimateOpen={isClimateOpen}
        setIntermediateMapData={setIntermediateMapData}
      />
    </GameShell>
  );
}

export default MainGame;