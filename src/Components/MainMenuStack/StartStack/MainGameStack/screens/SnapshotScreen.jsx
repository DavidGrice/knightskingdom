'use client';

import SnapShot from '../SnapShot/SnapShot';
import { useScreenReady } from '@/lib/context/GameLoadingProvider';

const SnapshotScreen = ({
  mapData,
  selectedProfile,
  navigateToMainGame,
  onRemoveSnapshot,
}) => {
  useScreenReady();

  return (
    <SnapShot
      navigateToMainGame={navigateToMainGame}
      mapData={mapData}
      selectedProfile={selectedProfile}
      onRemoveSnapshot={onRemoveSnapshot}
    />
  );
};

export default SnapshotScreen;