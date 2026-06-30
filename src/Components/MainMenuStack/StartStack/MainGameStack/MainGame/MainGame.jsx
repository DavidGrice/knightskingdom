import React from 'react';
import { GameEngine } from './index';
import { Drive } from './ComponentTop/Drive/index';
import { Climate } from './ComponentBottom/Climate/index';
import { Music } from './ComponentBottom/Music/index';
import { GameShell, ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';
import { useGameContext } from '../context';

const MainGameContent = ({ navigateToStartMenu, mapData, customCreations }) => {
  const {
    state,
    hydrationScene,
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
    handleDriveViewSwitch,
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
    driveView,
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
      {showBucket && (
        <div>
          <Bucket
            dataSource="models"
            handleLoadModel={handleLoadModel}
            customCreations={customCreations}
          />
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
            driveView={driveView}
            handleDriveViewSwitch={handleDriveViewSwitch}
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
        hydrationScene={hydrationScene}
        color={color}
        mode={mode}
        driveView={driveView}
        isFollowing={isFollowing}
        addModel={selectedModelMode}
        customCreations={customCreations}
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