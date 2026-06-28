import { Modes } from '../MainGame/GameEngine/GameEngineResourceStack/index';
import { createEmptySceneState } from './sceneSchema';

export const initialGameState = {
  mode: Modes.NONE,
  selectedModelMode: 'NONE',
  isSaveOpen: false,
  showBucket: false,
  isPaletteOpen: false,
  color: null,
  isActionOpen: false,
  isFollowing: false,
  isClimateOpen: false,
  isMusicOpen: false,
  activeIcon: null,
  activeWeather: 0,
  selectedClimateMode: 'SUNNY',
  climateNeedsUpdating: false,
  activeMusic: 0,
  selectedMusic: 'NONE',
  activeCamera: null,
  cameraNeedsReset: false,
  sceneState: createEmptySceneState(),
  lastSaveMessage: null,
};

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_SELECTED_MODEL_MODE':
      return { ...state, selectedModelMode: action.payload };
    case 'RESET_MODES':
      return { ...state, mode: Modes.NONE, selectedModelMode: 'NONE' };
    case 'TOGGLE_SAVE':
      return { ...state, isSaveOpen: !state.isSaveOpen, lastSaveMessage: null };
    case 'SET_SAVE_MESSAGE':
      return { ...state, lastSaveMessage: action.payload, isSaveOpen: true };
    case 'TOGGLE_BUCKET':
      return { ...state, showBucket: action.payload };
    case 'TOGGLE_PALETTE':
      return { ...state, isPaletteOpen: action.payload };
    case 'SET_COLOR':
      return { ...state, color: action.payload, selectedModelMode: 'NONE' };
    case 'SET_ACTION_OPEN':
      return { ...state, isActionOpen: action.payload };
    case 'SET_FOLLOWING':
      return { ...state, isFollowing: action.payload };
    case 'TOGGLE_CLIMATE':
      return { ...state, isClimateOpen: action.payload };
    case 'TOGGLE_MUSIC':
      return { ...state, isMusicOpen: action.payload };
    case 'SET_ACTIVE_ICON':
      return {
        ...state,
        activeIcon: typeof action.payload === 'function'
          ? action.payload(state.activeIcon)
          : action.payload,
      };
    case 'SET_WEATHER':
      return {
        ...state,
        activeWeather: action.payload.index,
        selectedClimateMode: action.payload.climate,
        climateNeedsUpdating: true,
      };
    case 'SET_CLIMATE_NEEDS_UPDATING':
      return { ...state, climateNeedsUpdating: action.payload };
    case 'SET_ACTIVE_MUSIC':
      return { ...state, activeMusic: action.payload.index, selectedMusic: action.payload.track };
    case 'SET_ACTIVE_CAMERA':
      return { ...state, activeCamera: action.payload, selectedModelMode: 'NONE' };
    case 'SET_CAMERA_NEEDS_RESET':
      return { ...state, cameraNeedsReset: action.payload };
    case 'SET_SCENE_STATE':
      return { ...state, sceneState: action.payload };
    case 'CLOSE_OVERLAYS':
      return {
        ...state,
        isClimateOpen: false,
        isMusicOpen: false,
        activeIcon: null,
        selectedModelMode: 'NONE',
      };
    case 'CLOSE_PALETTE_AND_BUCKET':
      return { ...state, isPaletteOpen: false, showBucket: false };
    case 'HYDRATE_SCENE':
      return {
        ...state,
        sceneState: action.payload.scene || state.sceneState,
        selectedClimateMode: action.payload.climate || state.selectedClimateMode,
      };
    default:
      return state;
  }
};