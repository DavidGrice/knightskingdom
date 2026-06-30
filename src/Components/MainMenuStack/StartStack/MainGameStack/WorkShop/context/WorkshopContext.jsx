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

  const resetModes = useCallback(() => {
    dispatch({ type: 'RESET_MODES' });
  }, []);

  const closeBucket = useCallback(() => {
    dispatch({ type: 'TOGGLE_BUCKET', payload: false });
  }, []);

  const handleBucket = useCallback(() => {
    const next = !state.showBucket;
    dispatch({ type: 'TOGGLE_BUCKET', payload: next });
    if (next) {
      resetModes();
    }
  }, [state.showBucket, resetModes]);

  const handleBrickSelect = useCallback((item) => {
    if (!item) {
      dispatch({ type: 'SELECT_BRICK', payload: null });
      return;
    }
    const brickId = extractBrickId(item.modelPath);
    dispatch({ type: 'SELECT_BRICK', payload: brickId });
    dispatch({ type: 'TOGGLE_BUCKET', payload: false });
  }, []);

  const handleMove = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.MOVING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, [closeBucket]);

  const handleRotate = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.ROTATING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, [closeBucket]);

  const handleDelete = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.DELETING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, [closeBucket]);

  const handleDuplicate = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.DUPLICATING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, [closeBucket]);

  const handlePalette = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.PAINTING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
    dispatch({ type: 'TOGGLE_PALETTE', payload: !state.isPaletteOpen });
  }, [closeBucket, state.isPaletteOpen]);

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

  const value = useMemo(() => ({
    state,
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
    persistDraft,
  }), [
    state,
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