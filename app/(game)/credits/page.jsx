'use client';

import { useRouter } from 'next/navigation';
import Credits from '@/Components/MainMenuStack/Credits/Credits';
import { useScreenReady } from '@/lib/context/GameLoadingProvider';
import { beginNavigationLoading } from '@/lib/gameLoadingBus';
import { ROUTES } from '@/lib/routes';

export default function CreditsPage() {
  useScreenReady();
  const router = useRouter();

  return (
    <Credits
      navigateToMenu={() => {
        beginNavigationLoading();
        router.push(ROUTES.mainMenu);
      }}
    />
  );
}