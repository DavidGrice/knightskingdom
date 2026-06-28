import React, { useEffect, useState } from 'react';
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
  const [previewSnapshot, setPreviewSnapshot] = useState(() => {
    if (mapData?.sceneSnapshot?.imageDataUrl) {
      return mapData.sceneSnapshot;
    }
    const saved = mapData?.snapshots || [];
    return saved.find((entry) => entry.imageDataUrl) || mapData?.sceneSnapshot || null;
  });

  useEffect(() => {
    if (mapData?.sceneSnapshot?.imageDataUrl) {
      setPreviewSnapshot(mapData.sceneSnapshot);
    }
  }, [mapData?.sceneSnapshot]);

  const handleCheckmarkClick = () => {
    navigateToMainGame(mapData);
  };

  const previewImage = previewSnapshot?.imageDataUrl;

  return (
    <div className={styles.snapShotDiv}>
      <SnapShotHolder
        selectedProfile={selectedProfile}
        mapData={mapData}
        onRemoveSnapshot={onRemoveSnapshot}
        onSelectSnapshot={setPreviewSnapshot}
      />
      {previewImage && (
        <div className={styles.capturePreview}>
          <img src={previewImage} alt="Selected snapshot preview" />
        </div>
      )}
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