'use client';

import MyModels from '../MyModels/MyModels';

const MyModelsScreen = ({
  selectedProfile,
  onDeleteSavedWorld,
  navigateBackToGame,
}) => (
  <MyModels
    selectedProfile={selectedProfile}
    onDeleteSavedWorld={onDeleteSavedWorld}
    navigateBackToGame={navigateBackToGame}
  />
);

export default MyModelsScreen;