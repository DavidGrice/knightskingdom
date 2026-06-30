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

export const WorkshopProvider = ({ children }) => {
  const [state, dispatch] = useReducer(workshopReducer, initialWorkshopState);
  const engineRef = useRef(null);

  const resetModes = useCallback(() => {
    dispatch({ type: 'RESET_MODES' });
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
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.MOVING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, []);

  const handleRotate = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.ROTATING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, []);

  const handleDelete = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.DELETING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, []);

  const handleDuplicate = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.DUPLICATING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
  }, []);

  const handlePalette = useCallback(() => {
    dispatch({ type: 'SET_MODE', payload: WorkshopModes.PAINTING });
    dispatch({ type: 'SELECT_BRICK', payload: null });
    dispatch({ type: 'TOGGLE_PALETTE', payload: !state.isPaletteOpen });
  }, [state.isPaletteOpen]);

  const handleColor = useCallback((color) => {
    dispatch({ type: 'SET_COLOR', payload: color });
    engineRef.current?.setDefaultColor?.(color);
  }, []);

  const handleSweep = useCallback(() => {
    engineRef.current?.clearAllBricks?.();
    resetModes();
  }, [resetModes]);

  const value = useMemo(() => ({
    state,
    engineRef,
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
  }), [
    state,
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