'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  loadUserData,
  saveUserData,
  readSessionAuth,
  writeSessionAuth,
} from '@/services/userService';
import { ROUTES } from '../routes';

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const skipPersistRef = useRef(true);

  useLayoutEffect(() => {
    const session = readSessionAuth();
    setUserData(loadUserData());
    setIsAuthenticated(session.isAuthenticated);
    setSelectedProfile(session.selectedProfile);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !userData || skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    saveUserData(userData);
  }, [hydrated, userData]);

  const updateUserData = useCallback((newUserData) => {
    setUserData(newUserData);
  }, []);

  const navigateToMainMenu = useCallback(
    (profile) => {
      setIsAuthenticated(true);
      setSelectedProfile(profile);
      writeSessionAuth(profile);
      router.push(ROUTES.mainMenu);
    },
    [router]
  );

  const navigateToAuthentication = useCallback(() => {
    setIsAuthenticated(false);
    setSelectedProfile(null);
    writeSessionAuth(null);
    router.push(ROUTES.authentication);
  }, [router]);

  const value = useMemo(
    () => ({
      userData,
      hydrated,
      loading: !hydrated,
      isAuthenticated,
      selectedProfile,
      updateUserData,
      navigateToMainMenu,
      navigateToAuthentication,
    }),
    [
      userData,
      hydrated,
      isAuthenticated,
      selectedProfile,
      updateUserData,
      navigateToMainMenu,
      navigateToAuthentication,
    ]
  );

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error('useUserData must be used within UserDataProvider');
  }
  return context;
};

export default UserDataContext;