'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Authentication from '@/Components/AuthenticationStack/Authentication/Authentication';
import { useUserData } from '@/lib/context/UserDataProvider';
import { ROUTES } from '@/lib/routes';

export default function AuthenticationPage() {
  const {
    userData,
    hydrated,
    isAuthenticated,
    updateUserData,
    navigateToMainMenu,
  } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(ROUTES.mainMenu);
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="app-main-div">
      <Authentication
        userData={userData}
        updateUserData={updateUserData}
        navigateToMainMenu={navigateToMainMenu}
      />
    </div>
  );
}