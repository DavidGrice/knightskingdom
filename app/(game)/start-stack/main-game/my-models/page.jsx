'use client';

import { LazyMyModelsScreen } from '@/lib/lazyGameScreens';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function MyModelsPage() {
  const { currentProfile, onDeleteSavedWorld, navigateBackToGame } = useWorldSession();

  return (
    <LazyMyModelsScreen
      selectedProfile={currentProfile}
      onDeleteSavedWorld={onDeleteSavedWorld}
      navigateBackToGame={navigateBackToGame}
    />
  );
}