'use client';

import WorkShop from '../WorkShop/WorkShop';
import { useScreenReady } from '@/lib/context/GameLoadingProvider';

const WorkshopScreen = ({
  mapData,
  navigateToMainGame,
  currentProfile,
  workshopDraft,
  onSaveWorkshopDraft,
  onSaveWorkshopExport,
}) => {
  useScreenReady();

  return (
    <WorkShop
      mapData={mapData}
      navigateToMainGame={navigateToMainGame}
      currentProfile={currentProfile}
      workshopDraft={workshopDraft}
      onSaveWorkshopDraft={onSaveWorkshopDraft}
      onSaveWorkshopExport={onSaveWorkshopExport}
    />
  );
};

export default WorkshopScreen;