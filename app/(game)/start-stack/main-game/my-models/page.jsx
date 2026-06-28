'use client';

import { MyModels } from '@/Components/MainMenuStack/StartStack/MainGameStack';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function MyModelsPage() {
  const { currentProfile, onDeleteSavedWorld, navigateBackToGame } = useWorldSession();

  return (
    <MyModels
      selectedProfile={currentProfile}
      onDeleteSavedWorld={onDeleteSavedWorld}
      navigateBackToGame={navigateBackToGame}
    />
  );
}