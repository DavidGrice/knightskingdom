'use client';

import { MainGame } from '@/Components/MainMenuStack/StartStack/MainGameStack';
import { GameProvider } from '@/Components/MainMenuStack/StartStack/MainGameStack/context';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function MainGamePage() {
  const {
    worldData,
    currentProfile,
    navigateToStartMenu,
    navigateToWorkshop,
    navigateToSnapshot,
    navigateToMyModels,
    onSaveWorldProgress,
    onAppendSnapshot,
  } = useWorldSession();

  return (
    <GameProvider
      mapData={worldData}
      selectedProfile={currentProfile}
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
        mapData={worldData}
      />
    </GameProvider>
  );
}