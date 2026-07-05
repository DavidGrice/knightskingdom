import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './index';
import { Drive } from './ComponentTop/Drive/index';
import { Climate } from './ComponentBottom/Climate/index';
import { Music } from './ComponentBottom/Music/index';
import { GameShell, ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';
import { GAME_CREATIONS_TAB_INDEX } from '../shared/toolbarConfig/creationsBucket';
import { useGameContext } from '../context';

const MainGameContent = ({
  navigateToStartMenu,
  mapData,
  customCreations,
  openCreationsBucket,
  clearWorkshopBucketHint,
}) => {
  const {
    state,
    settings,
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

  const openedCreationsBucketRef = useRef(false);
  const [startOnCreationsTab, setStartOnCreationsTab] = useState(false);

  useEffect(() => {
    if (!openCreationsBucket || openedCreationsBucketRef.current) {
      return;
    }
    // Consume the one-shot hint immediately -- even if there's nothing to
    // show -- so it can't fire again on a later, unrelated return.
    openedCreationsBucketRef.current = true;
    clearWorkshopBucketHint?.();
    if (!customCreations || Object.keys(customCreations).length === 0) {
      return;
    }
    setStartOnCreationsTab(true);
    if (!showBucket) {
      handleBucket();
    }
  }, [
    openCreationsBucket,
    customCreations,
    showBucket,
    handleBucket,
    clearWorkshopBucketHint,
  ]);

  useEffect(() => {
    if (!showBucket && startOnCreationsTab) {
      setStartOnCreationsTab(false);
    }
  }, [showBucket, startOnCreationsTab]);

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
          activeToolbarIcon={activeIcon}
          setActiveToolbarIcon={setActiveIcon}
        />
      }
      bottom={
        <ComponentBottom
          mode="game"
          helpEnabled={settings.helpEnabled}
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
            initialTab={startOnCreationsTab ? GAME_CREATIONS_TAB_INDEX : undefined}
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
        key={settings.rendererKey}
        ref={gameEngineRef}
        settings={settings}
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