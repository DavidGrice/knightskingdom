'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserData } from '@/lib/context/UserDataProvider';
import { ROUTES } from '@/lib/routes';

export default function GameLayout({ children }) {
  const { hydrated, isAuthenticated } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(ROUTES.authentication);
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div className="app-main-div">{children}</div>;
}