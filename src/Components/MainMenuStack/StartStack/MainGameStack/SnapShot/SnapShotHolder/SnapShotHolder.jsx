import React from 'react';
import styles from './SnapShotHolder.module.css';
import SnapShotBody from './SnapShotBody/SnapShotBody';

const SnapShotHolder = ({
  selectedProfile,
  mapData,
  onRemoveSnapshot,
  onSelectSnapshot,
}) => (
  <div className={styles.componentHolder}>
    <SnapShotBody
      selectedProfile={selectedProfile}
      mapData={mapData}
      onRemoveSnapshot={onRemoveSnapshot}
      onSelectSnapshot={onSelectSnapshot}
    />
  </div>
);

export default SnapShotHolder;