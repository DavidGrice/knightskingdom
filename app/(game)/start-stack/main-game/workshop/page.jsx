'use client';

import { WorkShop } from '@/Components/MainMenuStack/StartStack/MainGameStack';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';

export default function WorkshopPage() {
  const { navigateToMainGame } = useWorldSession();

  return <WorkShop navigateToMainGame={navigateToMainGame} />;
}