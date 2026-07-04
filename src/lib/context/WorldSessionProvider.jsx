'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { beginNavigationLoading } from '@/lib/gameLoadingBus';
import { ROUTES } from '../routes';
import { useUserData } from './UserDataProvider';
import {
  saveWorldProgress,
  appendWorldSnapshot,
  deleteSavedWorld,
  removeWorldSnapshot,
} from '@/api/worldSave';
import { getWorkshopDraft, saveWorkshopDraft } from '@/api/workshopSave';
import { getCustomCreations, saveCustomCreation } from '@/api/customCreations';

const WorldSessionContext = createContext(null);

export const WorldSessionProvider = ({ children }) => {
  const router = useRouter();
  const { userData, selectedProfile, updateUserData } = useUserData();
  const [worldData, setWorldData] = useState(null);
  // One-shot "open the creations bucket" signal, set only when the workshop
  // exports a creation and consumed (cleared) by MainGame on read. Lives
  // OUTSIDE worldData on purpose: navigation used to merge stale worldData
  // snapshots captured at workshop entry, resurrecting the flag and popping
  // the bucket open on returns that shouldn't trigger it.
  const [creationsBucketHint, setCreationsBucketHint] = useState(false);
  if (typeof window !== 'undefined') {
    // Dev/test-only introspection, matching the engines' window hooks.
    window.__creationsBucketHint = creationsBucketHint;
  }

  const currentProfile = useMemo(
    () => userData?.find((p) => p.id === selectedProfile?.id) || selectedProfile,
    [userData, selectedProfile]
  );

  const navigateToStartMenu = useCallback(() => {
    beginNavigationLoading();
    router.push(ROUTES.startStack.start);
  }, [router]);

  // Legacy flag scrubber: openCreationsBucket must never ride along inside
  // worldData snapshots (see creationsBucketHint above).
  const stripBucketFlag = (data) => {
    if (!data || data.openCreationsBucket === undefined) {
      return data;
    }
    const { openCreationsBucket: _legacy, ...rest } = data;
    return rest;
  };

  const navigateToMainGame = useCallback(
    (mapData) => {
      if (mapData) {
        setWorldData((prev) => ({
          ...stripBucketFlag(prev),
          ...stripBucketFlag(mapData),
        }));
      }
      beginNavigationLoading(['world-assets']);
      router.push(ROUTES.startStack.mainGame);
    },
    [router]
  );

  const navigateToWorkshop = useCallback(
    (updatedWorldData) => {
      if (updatedWorldData) {
        setWorldData(stripBucketFlag(updatedWorldData));
      }
      beginNavigationLoading();
      router.push(ROUTES.startStack.workshop);
    },
    [router]
  );

  const navigateToSnapshot = useCallback(
    (snapshotData) => {
      if (snapshotData) {
        setWorldData((prevData) => {
          const base = prevData || {};
          const existing = base.snapshots || [];
          const alreadyStored = snapshotData.id != null
            && existing.some((entry) => entry.id === snapshotData.id);
          const snapshots = snapshotData.imageDataUrl && !alreadyStored
            ? [...existing, snapshotData]
            : existing;

          return {
            ...base,
            sceneSnapshot: snapshotData,
            snapshots,
          };
        });
      }
      beginNavigationLoading();
      router.push(ROUTES.startStack.snapshot);
    },
    [router]
  );

  const navigateToMyModels = useCallback(() => {
    beginNavigationLoading();
    router.push(ROUTES.startStack.myModels);
  }, [router]);

  const navigateBackToGame = useCallback(() => {
    navigateToMainGame(worldData);
  }, [navigateToMainGame, worldData]);

  const onSaveWorldProgress = useCallback(
    (profileId, worldId, payload) => {
      if (!userData || !updateUserData) {
        return;
      }
      const updated = saveWorldProgress(userData, profileId, worldId, payload);
      updateUserData(updated);
      setWorldData((prev) => ({
        ...prev,
        savedScene: payload.scene,
        savedThumbnail: payload.thumbnail,
      }));
    },
    [userData, updateUserData]
  );

  const onAppendSnapshot = useCallback(
    (profileId, worldId, snapshotEntry) => {
      if (!userData || !updateUserData) {
        return;
      }
      const updated = appendWorldSnapshot(
        userData,
        profileId,
        worldId,
        snapshotEntry
      );
      updateUserData(updated);
    },
    [userData, updateUserData]
  );

  const onDeleteSavedWorld = useCallback(
    (worldId) => {
      if (!userData || !updateUserData || !currentProfile?.id) {
        return;
      }
      const updated = deleteSavedWorld(userData, currentProfile.id, worldId);
      updateUserData(updated);
    },
    [userData, updateUserData, currentProfile]
  );

  const onSaveWorkshopDraft = useCallback(
    (profileId, worldId, payload) => {
      if (!userData || !updateUserData) {
        return;
      }
      const updated = saveWorkshopDraft(userData, profileId, worldId, payload);
      updateUserData(updated);
      setWorldData((prev) => ({
        ...prev,
        workshopDraft: {
          brickInstances: payload.brickInstances || [],
          thumbnail: payload.thumbnail ?? null,
          updatedAt: new Date().toISOString(),
        },
      }));
    },
    [userData, updateUserData],
  );

  const workshopDraft = useMemo(
    () => getWorkshopDraft(currentProfile, worldData?.id)
      || worldData?.workshopDraft
      || null,
    [currentProfile, worldData],
  );

  const customCreations = useMemo(() => {
    const fromProfile = getCustomCreations(currentProfile);
    if (Object.keys(fromProfile).length > 0) {
      return fromProfile;
    }
    return worldData?.sessionCustomCreations ?? {};
  }, [currentProfile, worldData?.sessionCustomCreations]);

  const onSaveWorkshopExport = useCallback(
    (profileId, worldId, payload) => {
      if (!userData || !updateUserData) {
        return null;
      }

      const creationId = payload.creationId || crypto.randomUUID();
      let updated = saveCustomCreation(userData, profileId, {
        id: creationId,
        name: payload.name,
        brickInstances: payload.brickInstances || [],
        thumbnail: payload.thumbnail ?? null,
        worldId,
      });
      updated = saveWorkshopDraft(updated, profileId, worldId, {
        brickInstances: payload.brickInstances || [],
        thumbnail: payload.thumbnail ?? null,
        creationId,
      });
      updateUserData(updated);

      const savedProfile = updated.find((p) => String(p.id) === String(profileId));
      const sessionCustomCreations = getCustomCreations(savedProfile);

      const draft = {
        brickInstances: payload.brickInstances || [],
        thumbnail: payload.thumbnail ?? null,
        creationId,
        updatedAt: new Date().toISOString(),
      };
      setWorldData((prev) => ({
        ...prev,
        workshopDraft: draft,
        sessionCustomCreations,
      }));
      setCreationsBucketHint(true);

      return creationId;
    },
    [userData, updateUserData],
  );

  const clearWorkshopBucketHint = useCallback(() => {
    setCreationsBucketHint(false);
  }, []);

  const onRemoveSnapshot = useCallback(
    (worldId, snapshotId) => {
      if (!userData || !updateUserData || !currentProfile?.id) {
        return;
      }
      const updated = removeWorldSnapshot(
        userData,
        currentProfile.id,
        worldId,
        snapshotId,
      );
      updateUserData(updated);
      setWorldData((prev) => {
        if (!prev) {
          return prev;
        }
        const snapshots = (prev.snapshots || []).filter(
          (entry) => String(entry.id) !== String(snapshotId),
        );
        const sceneSnapshot =
          prev.sceneSnapshot?.id === snapshotId ? snapshots[0] || null : prev.sceneSnapshot;
        return { ...prev, snapshots, sceneSnapshot };
      });
    },
    [userData, updateUserData, currentProfile]
  );

  const value = useMemo(
    () => ({
      worldData,
      currentProfile,
      navigateToStartMenu,
      navigateToMainGame,
      navigateToWorkshop,
      navigateToSnapshot,
      navigateToMyModels,
      navigateBackToGame,
      onSaveWorldProgress,
      onAppendSnapshot,
      onDeleteSavedWorld,
      onRemoveSnapshot,
      onSaveWorkshopDraft,
      onSaveWorkshopExport,
      workshopDraft,
      customCreations,
      creationsBucketHint,
      clearWorkshopBucketHint,
    }),
    [
      worldData,
      currentProfile,
      workshopDraft,
      customCreations,
      creationsBucketHint,
      clearWorkshopBucketHint,
      navigateToStartMenu,
      navigateToMainGame,
      navigateToWorkshop,
      navigateToSnapshot,
      navigateToMyModels,
      navigateBackToGame,
      onSaveWorldProgress,
      onAppendSnapshot,
      onDeleteSavedWorld,
      onRemoveSnapshot,
      onSaveWorkshopDraft,
      onSaveWorkshopExport,
    ]
  );

  return (
    <WorldSessionContext.Provider value={value}>
      {children}
    </WorldSessionContext.Provider>
  );
};

export const useWorldSession = () => {
  const context = useContext(WorldSessionContext);
  if (!context) {
    throw new Error('useWorldSession must be used within WorldSessionProvider');
  }
  return context;
};

export default WorldSessionContext;