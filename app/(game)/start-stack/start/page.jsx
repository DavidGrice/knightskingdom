'use client';

import { useRouter } from 'next/navigation';
import Start from '@/Components/MainMenuStack/StartStack/Start/Start';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';
import { useScreenReady } from '@/lib/context/GameLoadingProvider';
import { beginNavigationLoading } from '@/lib/gameLoadingBus';
import { ROUTES } from '@/lib/routes';

export default function StartPage() {
  useScreenReady();
  const router = useRouter();
  const { navigateToMainGame } = useWorldSession();

  return (
    <Start
      navigateToMenu={() => {
        beginNavigationLoading();
        router.push(ROUTES.mainMenu);
      }}
      navigateToMainGame={navigateToMainGame}
    />
  );
}