'use client';

import { useRouter } from 'next/navigation';
import Credits from '@/Components/MainMenuStack/Credits/Credits';
import { ROUTES } from '@/lib/routes';

export default function CreditsPage() {
  const router = useRouter();

  return <Credits navigateToMenu={() => router.push(ROUTES.mainMenu)} />;
}