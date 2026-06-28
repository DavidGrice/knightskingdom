'use client';

import { LazyWorkshopScreen } from '@/lib/lazyGameScreens';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function WorkshopPage() {
  const { worldData, navigateToMainGame } = useWorldSession();

  return (
    <LazyWorkshopScreen
      mapData={worldData}
      navigateToMainGame={navigateToMainGame}
    />
  );
}