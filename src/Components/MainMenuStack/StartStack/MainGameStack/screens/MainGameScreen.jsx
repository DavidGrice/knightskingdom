'use client';

import MainGame from '../MainGame/MainGame';
import { GameProvider } from '../context';
import { useEffect } from 'react';
import { useGameLoading } from '@/lib/context/GameLoadingProvider';

const MainGameScreen = ({
  mapData,
  selectedProfile,
  onSaveWorldProgress,
  onAppendSnapshot,
  navigateToWorkshop,
  navigateToSnapshot,
  navigateToMyModels,
  navigateToStartMenu,
}) => {
  const { stopLoading } = useGameLoading();

  useEffect(() => {
    if (!mapData) {
      stopLoading('world-assets');
      stopLoading('navigation');
    }
  }, [mapData, stopLoading]);

  return (
    <GameProvider
      mapData={mapData}
      selectedProfile={selectedProfile}
      onSaveWorldProgress={onSaveWorldProgress}
      onAppendSnapshot={onAppendSnapshot}
      navigateToWorkshop={navigateToWorkshop}
      navigateToSnapshot={navigateToSnapshot}
      navigateToMyModels={navigateToMyModels}
    >
      <MainGame
        navigateToStartMenu={navigateToStartMenu}
        navigateToWorkshop={navigateToWorkshop}
        navigateToSnapshot={navigateToSnapshot}
        mapData={mapData}
      />
    </GameProvider>
  );
};

export default MainGameScreen;