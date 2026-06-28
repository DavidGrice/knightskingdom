import React from 'react';
import styles from './SnapShot.module.css';
import { SnapShotHolder } from './index';
import { checkmarks } from './SnapShotResourceStack/index';
import { CommonComponent } from '../../../../Common';

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
    <div className={styles.snapShotDiv}>
      <SnapShotHolder
        selectedProfile={selectedProfile}
        mapData={mapData}
        onRemoveSnapshot={onRemoveSnapshot}
      />
      <div className={styles.bottomLeftCorner}>
        <CommonComponent
          initialImage={checkmarks.checkMark2}
          hoverImage={checkmarks.checkMark4}
          altText="Checkmark"
          onClick={handleCheckmarkClick}
        />
      </div>
    </div>
  );
};

export default SnapShot;