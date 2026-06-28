'use client';

import { useRouter } from 'next/navigation';
import MainMenu from '@/Components/MainMenuStack/MainMenu/MainMenu';
import { useUserData } from '@/lib/context/UserDataProvider';
import { ROUTES } from '@/lib/routes';

export default function MainMenuPage() {
  const { selectedProfile, navigateToAuthentication } = useUserData();
  const router = useRouter();

  const currentProfile = selectedProfile;

  return (
    <MainMenu
      selectedProfile={currentProfile}
      navigateToAuthentication={navigateToAuthentication}
      navigateToStart={() => router.push(ROUTES.startStack.start)}
    />
  );
}