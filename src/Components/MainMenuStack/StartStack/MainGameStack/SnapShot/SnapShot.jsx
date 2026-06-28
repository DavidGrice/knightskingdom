import React, { useEffect, useState } from 'react';
import styles from './SnapShot.module.css';
import { SnapShotHolder } from './index';
import { checkmarks } from './SnapShotResourceStack/index';
import { CommonComponent } from '../../../../Common';
import { isValidSnapshotImage, resolveSnapshotImage } from '@/api/worldSave';

const SnapShot = ({
  navigateToMainGame,
  mapData,
  selectedProfile,
  onRemoveSnapshot,
}) => {
  const pickPreviewSnapshot = (snapshot) => {
    const image = resolveSnapshotImage(snapshot);
    return isValidSnapshotImage(image) ? snapshot : null;
  };

  const [previewSnapshot, setPreviewSnapshot] = useState(() => {
    const fromScene = pickPreviewSnapshot(mapData?.sceneSnapshot);
    if (fromScene) {
      return fromScene;
    }
    const saved = mapData?.snapshots || [];
    return saved.map(pickPreviewSnapshot).find(Boolean) || null;
  });

  useEffect(() => {
    const fromScene = pickPreviewSnapshot(mapData?.sceneSnapshot);
    if (fromScene) {
      setPreviewSnapshot(fromScene);
    }
  }, [mapData?.sceneSnapshot]);

  const handleCheckmarkClick = () => {
    navigateToMainGame(mapData);
  };

  const previewImage = resolveSnapshotImage(previewSnapshot);

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