'use client';

import { LazyWorkshopScreen } from '@/lib/lazyGameScreens';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function WorkshopPage() {
  const {
    worldData,
    navigateToMainGame,
    currentProfile,
    workshopDraft,
    onSaveWorkshopDraft,
    onSaveWorkshopExport,
  } = useWorldSession();

  return (
    <LazyWorkshopScreen
      mapData={worldData}
      navigateToMainGame={navigateToMainGame}
      currentProfile={currentProfile}
      workshopDraft={workshopDraft}
      onSaveWorkshopDraft={onSaveWorkshopDraft}
      onSaveWorkshopExport={onSaveWorkshopExport}
    />
  );
}