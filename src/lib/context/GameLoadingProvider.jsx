'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
import LoadingModal from '@/Components/Common/LoadingModal/LoadingModal';

const GameLoadingContext = createContext(null);

export const GameLoadingProvider = ({ children }) => {
  const pathname = usePathname();
  const [sources, setSources] = useState(() => new Set());
  const previousPathname = useRef(pathname);

  const startLoading = useCallback((key) => {
    setSources((prev) => {
      if (prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const stopLoading = useCallback((key) => {
    setSources((prev) => {
      if (!prev.has(key)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  useEffect(() => {
    if (previousPathname.current === pathname) {
      return;
    }
    previousPathname.current = pathname;
    startLoading('navigation');
  }, [pathname, startLoading]);

  const isLoading = sources.size > 0;

  const value = useMemo(
    () => ({
      startLoading,
      stopLoading,
      isLoading,
    }),
    [startLoading, stopLoading, isLoading],
  );

  return (
    <GameLoadingContext.Provider value={value}>
      {children}
      <LoadingModal visible={isLoading} />
    </GameLoadingContext.Provider>
  );
};

export const useGameLoading = () => {
  const context = useContext(GameLoadingContext);
  if (!context) {
    throw new Error('useGameLoading must be used within GameLoadingProvider');
  }
  return context;
};

/** Call when a screen has mounted and is ready to dismiss route-transition loading. */
export const useScreenReady = () => {
  const { stopLoading } = useGameLoading();

  useEffect(() => {
    stopLoading('navigation');
  }, [stopLoading]);
};

/** Keep a named loading source active while `active` is true. */
export const useManagedLoading = (key, active) => {
  const { startLoading, stopLoading } = useGameLoading();

  useEffect(() => {
    if (!active) {
      stopLoading(key);
      return undefined;
    }

    startLoading(key);
    return () => stopLoading(key);
  }, [key, active, startLoading, stopLoading]);
};

/** Used by next/dynamic while a lazy screen chunk is downloading. */
export const DynamicImportLoading = () => {
  const { startLoading, stopLoading } = useGameLoading();

  useEffect(() => {
    startLoading('dynamic-import');
    return () => stopLoading('dynamic-import');
  }, [startLoading, stopLoading]);

  return null;
};

export default GameLoadingContext;