import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Modes } from '../MainGame/GameEngine/GameEngineResourceStack/index';
import { musicTracks } from '../MainGame/MainGameResourceStack/index';
import { createEmptySceneState, createSnapshotEntry } from './sceneSchema';
import { gameReducer, initialGameState } from './gameReducer';

const GameContext = createContext(null);

const CLIMATE_BY_INDEX = [
  'SUNNY', 'WINDY', 'FOGGY', 'RAIN', 'SNOW',
  'DARK_SUNNY', 'DARK_WINDY', 'DARK_FOGGY', 'DARK_DRIZZLY', 'DARK_THUNDERSTORM',
];

const MUSIC_BY_INDEX = ['NONE', 'GOOD', 'VERYGOOD', 'BAD', 'VERYBAD'];

const MUSIC_TRACK_SOURCES = {
  GOOD: musicTracks.GOOD,
  VERYGOOD: musicTracks.VERYGOOD,
  BAD: musicTracks.BAD,
  VERYBAD: musicTracks.VERYBAD,
};

export const GameProvider = ({
  children,
  mapData,
  selectedProfile,
  onSaveWorldProgress,
  onAppendSnapshot,
  navigateToWorkshop,
  navigateToSnapshot,
  navigateToMyModels,
}) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [hydrationScene, setHydrationScene] = useState(null);
  const gameEngineRef = useRef(null);
  const audioRef = useRef(null);
  const audioPlayTokenRef = useRef(0);

  const stopMusicPlayback = useCallback(() => {
    audioPlayTokenRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  }, []);

  const startMusicPlayback = useCallback((track) => {
    const source = MUSIC_TRACK_SOURCES[track];
    if (!source) {
      stopMusicPlayback();
      return;
    }

    stopMusicPlayback();
    const playToken = audioPlayTokenRef.current;
    const newAudio = new Audio(source);
    newAudio.loop = true;
    audioRef.current = newAudio;

    const playAttempt = newAudio.play();
    if (playAttempt?.catch) {
      playAttempt.catch((error) => {
        if (playToken !== audioPlayTokenRef.current) {
          return;
        }
        if (error?.name !== 'AbortError') {
          console.warn('Music playback failed:', error);
        }
      });
    }
  }, [stopMusicPlayback]);

  useEffect(() => () => {
    stopMusicPlayback();
  }, [stopMusicPlayback]);

  useEffect(() => {
    const saved = selectedProfile?.savedWorlds?.[String(mapData?.id)];
    if (saved?.scene) {
      dispatch({
        type: 'HYDRATE_SCENE',
        payload: { scene: saved.scene, climate: saved.scene.climate },
      });
      setHydrationScene(saved.scene);
      return;
    }

    dispatch({ type: 'SET_SCENE_STATE', payload: createEmptySceneState() });
    setHydrationScene(null);
  }, [mapData?.id, selectedProfile]);

  const resetModes = useCallback(() => {
    dispatch({ type: 'RESET_MODES' });
  }, []);

  const captureCurrentScene = useCallback(() => {
    if (gameEngineRef.current?.getSceneState) {
      return gameEngineRef.current.getSceneState();
    }
    return state.sceneState;
  }, [state.sceneState]);

  const handleSave = useCallback(() => {
    stopMusicPlayback();
    dispatch({ type: 'SET_ACTIVE_MUSIC', payload: { index: 0, track: 'NONE' } });

    try {
      if (selectedProfile?.id && mapData?.id && onSaveWorldProgress) {
        const scene = captureCurrentScene();
        let thumbnail = null;
        try {
          thumbnail = gameEngineRef.current?.captureFrame?.() || null;
        } catch {
          // Canvas capture can fail; save should still proceed.
        }

        onSaveWorldProgress(selectedProfile.id, mapData.id, {
          scene,
          thumbnail,
          worldName: mapData.name,
        });
      }
    } finally {
      resetModes();
      navigateToMyModels?.();
    }
  }, [selectedProfile, mapData, onSaveWorldProgress, captureCurrentScene, resetModes, navigateToMyModels, stopMusicPlayback]);

  const handleBucket = useCallback(() => {
    const next = !state.showBucket;
    dispatch({ type: 'TOGGLE_BUCKET', payload: next });
    if (!state.showBucket) {
      resetModes();
    }
  }, [state.showBucket, resetModes]);

  const handleLoadModel = useCallback((model) => {
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: model });
    dispatch({ type: 'SET_MODE', payload: Modes.ADDING });
  }, []);

  const closeBucket = useCallback(() => {
    if (state.showBucket) {
      dispatch({ type: 'TOGGLE_BUCKET', payload: false });
    }
  }, [state.showBucket]);

  const handleMove = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: Modes.MOVING });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [closeBucket]);

  const handleRotate = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: Modes.ROTATING });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [closeBucket]);

  const handlePalette = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: Modes.PAINTING });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
    if (state.isFollowing) {
      dispatch({ type: 'SET_FOLLOWING', payload: false });
    }
    dispatch({ type: 'TOGGLE_PALETTE', payload: !state.isPaletteOpen });
  }, [closeBucket, state.isFollowing, state.isPaletteOpen]);

  const handleColor = useCallback((color) => {
    dispatch({ type: 'SET_COLOR', payload: color });
  }, []);

  const handleDelete = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: Modes.DELETING });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [closeBucket]);

  const handleAction = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_ACTION_OPEN', payload: !state.isActionOpen });
    dispatch({ type: 'SET_MODE', payload: Modes.ACTION });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [closeBucket, state.isActionOpen]);

  const handleDrive = useCallback(() => {
    if (state.isPaletteOpen) {
      dispatch({ type: 'TOGGLE_PALETTE', payload: false });
    }
    if (state.showBucket) {
      dispatch({ type: 'TOGGLE_BUCKET', payload: false });
    }
    dispatch({ type: 'SET_MODE', payload: Modes.DRIVING });
    if (state.isFollowing) {
      dispatch({ type: 'SET_FOLLOWING', payload: false });
      dispatch({ type: 'SET_CAMERA_NEEDS_RESET', payload: true });
    } else {
      dispatch({ type: 'SET_FOLLOWING', payload: true });
      dispatch({ type: 'SET_DRIVE_VIEW', payload: 'third' });
      dispatch({ type: 'SET_CAMERA_NEEDS_RESET', payload: false });
    }
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [state.isFollowing, state.isPaletteOpen, state.showBucket]);

  const handleDriveViewSwitch = useCallback((view) => {
    dispatch({ type: 'SET_DRIVE_VIEW', payload: view });
  }, []);

  const handlePaintAndDrive = useCallback(() => {
    if (state.isPaletteOpen) {
      dispatch({ type: 'TOGGLE_PALETTE', payload: false });
    }
    if (state.isFollowing) {
      dispatch({ type: 'SET_FOLLOWING', payload: false });
    }
    if (state.showBucket) {
      dispatch({ type: 'TOGGLE_BUCKET', payload: false });
    }
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [state.isFollowing, state.isPaletteOpen, state.showBucket]);

  const handlePlay = useCallback(() => {
    closeBucket();
    dispatch({ type: 'SET_MODE', payload: Modes.PLAYING });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [closeBucket]);

  const handleClimate = useCallback(() => {
    if (state.isMusicOpen) {
      dispatch({ type: 'TOGGLE_MUSIC', payload: false });
    }
    dispatch({ type: 'TOGGLE_CLIMATE', payload: !state.isClimateOpen });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [state.isClimateOpen, state.isMusicOpen]);

  const handleWeatherChange = useCallback((index) => {
    dispatch({
      type: 'SET_WEATHER',
      payload: { index, climate: CLIMATE_BY_INDEX[index] || 'SUNNY' },
    });
  }, []);

  const handleMusicChange = useCallback((index) => {
    const track = MUSIC_BY_INDEX[index] || 'NONE';

    if (track === 'NONE') {
      stopMusicPlayback();
    } else {
      startMusicPlayback(track);
    }

    dispatch({ type: 'SET_ACTIVE_MUSIC', payload: { index, track } });
  }, [startMusicPlayback, stopMusicPlayback]);

  const handleMusic = useCallback(() => {
    if (state.isClimateOpen) {
      dispatch({ type: 'TOGGLE_CLIMATE', payload: false });
    }
    dispatch({ type: 'TOGGLE_MUSIC', payload: !state.isMusicOpen });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, [state.isClimateOpen, state.isMusicOpen]);

  const closeClimate = useCallback(() => {
    dispatch({ type: 'TOGGLE_CLIMATE', payload: false });
    dispatch({ type: 'SET_ACTIVE_ICON', payload: null });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, []);

  const closeMusic = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUSIC', payload: false });
    dispatch({ type: 'SET_ACTIVE_ICON', payload: null });
    dispatch({ type: 'SET_SELECTED_MODEL_MODE', payload: 'NONE' });
  }, []);

  const setActiveIcon = useCallback((value) => {
    dispatch({ type: 'SET_ACTIVE_ICON', payload: value });
  }, []);

  const handleNavigateToWorkshop = useCallback(() => {
    const scene = captureCurrentScene();
    navigateToWorkshop({
      ...mapData,
      sceneSnapshot: scene,
    });
  }, [captureCurrentScene, mapData, navigateToWorkshop]);

  const handleNavigateToSnapShot = useCallback(() => {
    const scene = captureCurrentScene();

    const persistAndNavigate = (imageDataUrl) => {
      if (!scene && !imageDataUrl) {
        return;
      }

      const snapshotEntry = imageDataUrl
        ? createSnapshotEntry(imageDataUrl, scene)
        : { scene };

      if (selectedProfile?.id && mapData?.id && onAppendSnapshot) {
        onAppendSnapshot(selectedProfile.id, mapData.id, snapshotEntry);
      }

      navigateToSnapshot(snapshotEntry);
    };

    requestAnimationFrame(() => {
      const imageDataUrl = gameEngineRef.current?.captureFrame?.();
      persistAndNavigate(imageDataUrl);
    });
  }, [captureCurrentScene, selectedProfile, mapData, onAppendSnapshot, navigateToSnapshot]);

  const handleSceneChange = useCallback((sceneState) => {
    dispatch({ type: 'SET_SCENE_STATE', payload: sceneState });
  }, []);

  const value = useMemo(() => ({
    state,
    hydrationScene,
    gameEngineRef,
    resetModes,
    handleSave,
    handleBucket,
    handleLoadModel,
    handleMove,
    handleRotate,
    handlePalette,
    handleColor,
    handleDelete,
    handleAction,
    handleDrive,
    handleDriveViewSwitch,
    handlePaintAndDrive,
    handlePlay,
    handleClimate,
    handleWeatherChange,
    handleMusicChange,
    handleMusic,
    closeClimate,
    closeMusic,
    setActiveIcon,
    handleNavigateToWorkshop,
    handleNavigateToSnapShot,
    handleSceneChange,
    setClimateNeedsUpdating: (payload) => dispatch({ type: 'SET_CLIMATE_NEEDS_UPDATING', payload }),
    setCameraNeedsReset: (payload) => dispatch({ type: 'SET_CAMERA_NEEDS_RESET', payload }),
    setActiveWeather: (index) => handleWeatherChange(index),
    setSelectedClimateMode: (climate) => {
      const index = CLIMATE_BY_INDEX.indexOf(climate);
      dispatch({
        type: 'SET_WEATHER',
        payload: { index: index >= 0 ? index : 0, climate: climate || 'SUNNY' },
      });
    },
    setActiveMusic: (index) => handleMusicChange(index),
  }), [
    state,
    hydrationScene,
    resetModes,
    handleSave,
    handleBucket,
    handleLoadModel,
    handleMove,
    handleRotate,
    handlePalette,
    handleColor,
    handleDelete,
    handleAction,
    handleDrive,
    handleDriveViewSwitch,
    handlePaintAndDrive,
    handlePlay,
    handleClimate,
    handleWeatherChange,
    handleMusicChange,
    handleMusic,
    closeClimate,
    closeMusic,
    setActiveIcon,
    handleNavigateToWorkshop,
    handleNavigateToSnapShot,
    handleSceneChange,
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within GameProvider');
  }
  return context;
};

export default GameContext;