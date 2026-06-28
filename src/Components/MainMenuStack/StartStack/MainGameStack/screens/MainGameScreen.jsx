'use client';

import MainGame from '../MainGame/MainGame';
import { GameProvider } from '../context';

const MainGameScreen = ({
  mapData,
  selectedProfile,
  onSaveWorldProgress,
  onAppendSnapshot,
  navigateToWorkshop,
  navigateToSnapshot,
  navigateToMyModels,
  navigateToStartMenu,
}) => (
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

export default MainGameScreen;