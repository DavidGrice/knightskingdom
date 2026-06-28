'use client';

import WorkShop from '../WorkShop/WorkShop';

const WorkshopScreen = ({ mapData, navigateToMainGame }) => (
  <WorkShop navigateToMainGame={navigateToMainGame} mapData={mapData} />
);

export default WorkshopScreen;