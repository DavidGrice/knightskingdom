import React from 'react';
import { GameEngine } from './index';
import { Drive } from './ComponentTop/Drive/index';
import { Climate } from './ComponentBottom/Climate/index';
import { Music } from './ComponentBottom/Music/index';
import { GameShell, ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';
import { useGameContext } from '../context';

const MainGameContent = ({ navigateToStartMenu, mapData }) => {
  const {
    state,
    gameEngineRef,
    resetModes,
    handleSave,
    handleBucket,
    handleLoadModel,
    handleMove,
    handleRotate,
    handlePalette,
    handleColor,
    handleDelete,
    handleAction,
    handleDrive,
    handleCameraSwitch,
    handlePaintAndDrive,
    handlePlay,
    handleClimate,
    handleWeatherChange,
    handleMusicChange,
    handleMusic,
    closeClimate,
    closeMusic,
    setActiveIcon,
    handleNavigateToWorkshop,
    handleNavigateToSnapShot,
    handleSceneChange,
    setClimateNeedsUpdating,
    setCameraNeedsReset,
    setActiveWeather,
    setSelectedClimateMode,
    setActiveMusic,
  } = useGameContext();

  const {
    mode,
    selectedModelMode,
    isSaveOpen,
    lastSaveMessage,
    showBucket,
    isPaletteOpen,
    color,
    isFollowing,
    isClimateOpen,
    isMusicOpen,
    activeIcon,
    activeWeather,
    selectedClimateMode,
    climateNeedsUpdating,
    activeMusic,
    activeCamera,
    cameraNeedsReset,
  } = state;

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
      {isSaveOpen && lastSaveMessage && (
        <div style={{
          position: 'absolute',
          top: '110px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '6px',
          zIndex: 5,
          fontSize: '14px',
        }}>
          {lastSaveMessage}
        </div>
      )}
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
        ref={gameEngineRef}
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
        onSceneChange={handleSceneChange}
      />
    </GameShell>
  );
};

const MainGame = (props) => <MainGameContent {...props} />;

export default MainGame;