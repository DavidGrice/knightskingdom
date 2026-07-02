'use client';

import { LazySnapshotScreen } from '@/lib/lazyGameScreens';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function SnapshotPage() {
  const {
    worldData,
    currentProfile,
    navigateToMainGame,
    onRemoveSnapshot,
  } = useWorldSession();

  return (
    <LazySnapshotScreen
      mapData={worldData}
      selectedProfile={currentProfile}
      navigateToMainGame={navigateToMainGame}
      onRemoveSnapshot={onRemoveSnapshot}
    />
  );
}