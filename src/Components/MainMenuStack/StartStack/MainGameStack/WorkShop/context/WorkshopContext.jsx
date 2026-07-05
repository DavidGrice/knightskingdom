'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { WorkshopModes } from '../WorkshopEngine/workshopModes';
import { extractBrickId } from '../WorkshopEngine/brickCatalog';
import { initialWorkshopState, workshopReducer } from './workshopReducer';
import { resolveGameSettings } from '@/lib/gameSettings';

const WorkshopContext = createContext(null);

export const WorkshopProvider = ({
  children,
  mapData,
  currentProfile,
  workshopDraft,
  onSaveWorkshopDraft,
  onSaveWorkshopExport,
  navigateToMainGame,
}) => {
  const [state, dispatch] = useReducer(workshopReducer, initialWorkshopState);
  const engineRef = useRef(null);

  // Same profile-options resolution the main game uses (lib/gameSettings.js).
  const settings = useMemo(() => resolveGameSettings(currentProfile), [currentProfile]);

  const resetModes = useCallback(() => {
    dispatch({ type: 'RESET_MODES' });
  }, []);

  // Closes BOTH toolbar panels (bucket + palette) and clears the pending
  // brick pick -- selecting any tool leaves at most one panel open.
  const closePanels = useCallback(() => {
    dispatch({ type: 'OPEN_EXCLUSIVE_PANEL', payload: {} });
    dispatch({ type: 'CLEAR_SELECTED_BRICK' });
  }, []);

  const handleBucket = useCallback(() => {
    const next = !state.showBucket;
    if (next) {
      dispatch({ type: 'OPEN_EXCLUSIVE_PANEL', payload: { panel: 'showBucket', open: true } });
      resetModes();
      return;
    }
    dispatch({ type: 'CLOSE_BUCKET' });
  }, [state.showBucket, resetModes]);

  const handleBrickSelect = useCallback((item) => {
    if (!item) {
      dispatch({ type: 'SELECT_BRICK', payload: null });
      return;
    }
    const brickId = extractBrickId(item.modelPath);
    dispatch({ type: 'SELECT_BRICK', payload: brickId });
  }, []);

  const handleMove = useCallback(() => {
    closePanels();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.MOVING });
  }, [closePanels]);

  const handleRotate = useCallback(() => {
    closePanels();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.ROTATING });
  }, [closePanels]);

  const handleDelete = useCallback(() => {
    closePanels();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.DELETING });
  }, [closePanels]);

  const handleDuplicate = useCallback(() => {
    closePanels();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.DUPLICATING });
  }, [closePanels]);

  const handlePalette = useCallback(() => {
    const next = !state.isPaletteOpen;
    dispatch({ type: 'OPEN_EXCLUSIVE_PANEL', payload: { panel: 'isPaletteOpen', open: next } });
    dispatch({ type: 'CLEAR_SELECTED_BRICK' });
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.PAINTING });
  }, [state.isPaletteOpen]);

  const handleColor = useCallback((color) => {
    dispatch({ type: 'SET_COLOR', payload: color });
    engineRef.current?.setDefaultColor?.(color);
  }, []);

  const handleSweep = useCallback(() => {
    engineRef.current?.clearAllBricks?.();
    resetModes();
  }, [resetModes]);

  const persistDraft = useCallback(() => {
    const profileId = currentProfile?.id;
    const worldId = mapData?.id;
    if (!profileId || worldId == null || !onSaveWorkshopDraft) {
      return;
    }

    const brickInstances = engineRef.current?.getBrickInstances?.() ?? [];
    let thumbnail = workshopDraft?.thumbnail ?? null;
    try {
      thumbnail = engineRef.current?.captureFrame?.() || thumbnail;
    } catch {
      // Canvas capture can fail; still persist brick list.
    }

    onSaveWorkshopDraft(profileId, worldId, { brickInstances, thumbnail });
  }, [currentProfile, mapData, onSaveWorkshopDraft, workshopDraft]);

  const handleSave = useCallback(() => {
    const profileId = currentProfile?.id;
    const worldId = mapData?.id;
    const brickInstances = engineRef.current?.getBrickInstances?.() ?? [];
    let thumbnail = workshopDraft?.thumbnail ?? null;
    try {
      thumbnail = engineRef.current?.captureFrame?.() || thumbnail;
    } catch {
      // Canvas capture can fail; still export brick list.
    }

    if (profileId && worldId != null && onSaveWorkshopExport) {
      onSaveWorkshopExport(profileId, worldId, {
        creationId: workshopDraft?.creationId ?? null,
        brickInstances,
        thumbnail,
        name: mapData?.name ? `${mapData.name} Creation` : 'My Creation',
      });
    } else {
      persistDraft();
    }

    navigateToMainGame?.(mapData);
  }, [
    currentProfile,
    mapData,
    workshopDraft,
    onSaveWorkshopExport,
    persistDraft,
    navigateToMainGame,
  ]);

  // The door button: keep the work (draft persists and re-hydrates on the
  // next visit) but do NOT export a creation -- exporting is the save
  // button's job, and it's what pops the creations bucket open back in the
  // main game. The door used to alias handleSave, so every exit exported
  // and the bucket appeared on every return.
  const handleLeave = useCallback(() => {
    persistDraft();
    navigateToMainGame?.(mapData);
  }, [persistDraft, navigateToMainGame, mapData]);

  const value = useMemo(() => ({
    state,
    settings,
    engineRef,
    mapData,
    workshopDraft,
    resetModes,
    handleBucket,
    handleBrickSelect,
    handleMove,
    handleRotate,
    handleDelete,
    handleDuplicate,
    handlePalette,
    handleColor,
    handleSweep,
    handleSave,
    handleLeave,
    persistDraft,
  }), [
    state,
    settings,
    mapData,
    workshopDraft,
    resetModes,
    handleBucket,
    handleBrickSelect,
    handleMove,
    handleRotate,
    handleDelete,
    handleDuplicate,
    handlePalette,
    handleColor,
    handleSweep,
    handleSave,
    handleLeave,
    persistDraft,
  ]);

  return (
    <WorkshopContext.Provider value={value}>
      {children}
    </WorkshopContext.Provider>
  );
};

export const useWorkshopContext = () => {
  const context = useContext(WorkshopContext);
  if (!context) {
    throw new Error('useWorkshopContext must be used within WorkshopProvider');
  }
  return context;
};