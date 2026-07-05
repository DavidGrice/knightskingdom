import React from 'react';
import { SnapShotHolder } from './index';
import { BackCheckmarkButton, MenuScreenLayout } from '../../../../Common';
import backgroundImage from './SnapShotResourceStack/background.png';

const SnapShot = ({
  navigateToMainGame,
  mapData,
  selectedProfile,
  onRemoveSnapshot,
}) => {
  const handleCheckmarkClick = () => {
    navigateToMainGame(mapData);
  };

  return (
    <MenuScreenLayout
      screenKey="SNAPSHOT"
      backgroundImage={backgroundImage}
      bottomLeft={(
        <BackCheckmarkButton
          onClick={handleCheckmarkClick}
          altText="Checkmark"
        />
      )}
    >
      <SnapShotHolder
        selectedProfile={selectedProfile}
        mapData={mapData}
        onRemoveSnapshot={onRemoveSnapshot}
      />
    </MenuScreenLayout>
  );
};

export default SnapShot;