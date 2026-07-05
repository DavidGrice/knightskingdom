import React from 'react';
import MyModelsHolder from './MyModelsHolder/MyModelsHolder';
import { BackCheckmarkButton, MenuScreenLayout } from '../../../../Common';
import backgroundImage from './MyModelsResourceStack/background.png';

const MyModels = ({ selectedProfile, onDeleteSavedWorld, navigateBackToGame }) => {
  const handleCheckmarkClick = () => {
    navigateBackToGame();
  };

  return (
    <MenuScreenLayout
      screenKey="MY_MODELS"
      backgroundImage={backgroundImage}
      bottomLeft={(
        <BackCheckmarkButton
          onClick={handleCheckmarkClick}
          altText="Checkmark"
        />
      )}
    >
      <MyModelsHolder
        selectedProfile={selectedProfile}
        onDeleteSavedWorld={onDeleteSavedWorld}
      />
    </MenuScreenLayout>
  );
};

export default MyModels;