'use client';

import { useRouter } from 'next/navigation';
import Start from '@/Components/MainMenuStack/StartStack/Start/Start';
import { useWorldSession } from '@/lib/context/WorldSessionProvider';
import { ROUTES } from '@/lib/routes';

export default function StartPage() {
  const router = useRouter();
  const { navigateToMainGame } = useWorldSession();

  return (
    <Start
      navigateToMenu={() => router.push(ROUTES.mainMenu)}
      navigateToMainGame={navigateToMainGame}
    />
  );
}