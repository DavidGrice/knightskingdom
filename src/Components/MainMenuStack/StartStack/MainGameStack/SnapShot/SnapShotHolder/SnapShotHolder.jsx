import React from 'react';
import styles from './SnapShotHolder.module.css';
import SnapShotBody from './SnapShotBody/SnapShotBody';

const SnapShotHolder = ({
  selectedProfile,
  mapData,
  onRemoveSnapshot,
}) => (
  <div className={styles.componentHolder}>
    <SnapShotBody
      selectedProfile={selectedProfile}
      mapData={mapData}
      onRemoveSnapshot={onRemoveSnapshot}
    />
  </div>
);

export default SnapShotHolder;