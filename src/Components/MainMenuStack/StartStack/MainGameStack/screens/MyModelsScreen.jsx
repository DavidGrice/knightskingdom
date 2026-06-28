'use client';

import MyModels from '../MyModels/MyModels';
import { useScreenReady } from '@/lib/context/GameLoadingProvider';

const MyModelsScreen = ({
  selectedProfile,
  onDeleteSavedWorld,
  navigateBackToGame,
}) => {
  useScreenReady();

  return (
    <MyModels
      selectedProfile={selectedProfile}
      onDeleteSavedWorld={onDeleteSavedWorld}
      navigateBackToGame={navigateBackToGame}
    />
  );
};

export default MyModelsScreen;