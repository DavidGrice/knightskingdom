'use client';

import { SnapShot } from '@/Components/MainMenuStack/StartStack/MainGameStack';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function SnapshotPage() {
  const { worldData, navigateToMainGame } = useWorldSession();

  return <SnapShot navigateToMainGame={navigateToMainGame} mapData={worldData} />;
}