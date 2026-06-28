'use client';

import WorkShop from '../WorkShop/WorkShop';
import { useScreenReady } from '@/lib/context/GameLoadingProvider';

const WorkshopScreen = ({ mapData, navigateToMainGame }) => {
  useScreenReady();

  return (
    <WorkShop navigateToMainGame={navigateToMainGame} mapData={mapData} />
  );
};

export default WorkshopScreen;