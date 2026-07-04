'use client';

import { LazyMainGameScreen } from '@/lib/lazyGameScreens';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function MainGamePage() {
  const {
    worldData,
    currentProfile,
    navigateToStartMenu,
    navigateToWorkshop,
    navigateToSnapshot,
    navigateToMyModels,
    onSaveWorldProgress,
    onAppendSnapshot,
    customCreations,
    creationsBucketHint,
    clearWorkshopBucketHint,
  } = useWorldSession();

  return (
    <LazyMainGameScreen
      mapData={worldData}
      selectedProfile={currentProfile}
      onSaveWorldProgress={onSaveWorldProgress}
      onAppendSnapshot={onAppendSnapshot}
      navigateToWorkshop={navigateToWorkshop}
      navigateToSnapshot={navigateToSnapshot}
      navigateToMyModels={navigateToMyModels}
      navigateToStartMenu={navigateToStartMenu}
      customCreations={customCreations}
      openCreationsBucket={creationsBucketHint}
      clearWorkshopBucketHint={clearWorkshopBucketHint}
    />
  );
}