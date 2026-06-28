'use client';

import { UserDataProvider } from '@/lib/context/UserDataProvider';
import { GameLoadingProvider } from '@/lib/context/GameLoadingProvider';

const AppProviders = ({ children }) => (
  <UserDataProvider>
    <GameLoadingProvider>
      {children}
    </GameLoadingProvider>
  </UserDataProvider>
);

export default AppProviders;