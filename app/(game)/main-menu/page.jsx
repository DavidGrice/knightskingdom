'use client';

import { useRouter } from 'next/navigation';
import MainMenu from '@/Components/MainMenuStack/MainMenu/MainMenu';
import { useUserData } from '@/lib/context/UserDataProvider';
import { useScreenReady } from '@/lib/context/GameLoadingProvider';
import { beginNavigationLoading } from '@/lib/gameLoadingBus';
import { ROUTES } from '@/lib/routes';

export default function MainMenuPage() {
  useScreenReady();
  const { selectedProfile, navigateToAuthentication } = useUserData();
  const router = useRouter();

  const currentProfile = selectedProfile;

  return (
    <MainMenu
      selectedProfile={currentProfile}
      navigateToAuthentication={navigateToAuthentication}
      navigateToStart={() => {
        beginNavigationLoading();
        router.push(ROUTES.startStack.start);
      }}
    />
  );
}