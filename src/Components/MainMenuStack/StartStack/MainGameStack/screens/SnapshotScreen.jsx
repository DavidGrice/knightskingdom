'use client';

import SnapShot from '../SnapShot/SnapShot';

const SnapshotScreen = ({
  mapData,
  selectedProfile,
  navigateToMainGame,
  onRemoveSnapshot,
}) => (
  <SnapShot
    navigateToMainGame={navigateToMainGame}
    mapData={mapData}
    selectedProfile={selectedProfile}
    onRemoveSnapshot={onRemoveSnapshot}
  />
);

export default SnapshotScreen;