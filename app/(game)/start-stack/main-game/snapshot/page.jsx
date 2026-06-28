'use client';

import { SnapShot } from '@/Components/MainMenuStack/StartStack/MainGameStack';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function SnapshotPage() {
  const {
    worldData,
    currentProfile,
    navigateToMainGame,
    onRemoveSnapshot,
  } = useWorldSession();

  return (
    <SnapShot
      navigateToMainGame={navigateToMainGame}
      mapData={worldData}
      selectedProfile={currentProfile}
      onRemoveSnapshot={onRemoveSnapshot}
    />
  );
}