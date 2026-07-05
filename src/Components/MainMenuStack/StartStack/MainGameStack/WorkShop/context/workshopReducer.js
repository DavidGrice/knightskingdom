import { WorkshopModes } from '../WorkshopEngine/workshopModes';

export const initialWorkshopState = {
  mode: WorkshopModes.NONE,
  selectedBrickId: null,
  color: 'eac000', // authentic LEGO yellow (palette glit018) -- the default brick colour
  showBucket: false,
  isPaletteOpen: false,
  activeChallenge: null,
  challengeMatch: { matched: 0, total: 0, complete: false },
};

export const workshopReducer = (state, action) => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'RESET_MODES':
      return { ...state, mode: WorkshopModes.NONE, selectedBrickId: null };
    case 'SELECT_BRICK':
      if (!action.payload) {
        return { ...state, selectedBrickId: null };
      }
      return {
        ...state,
        selectedBrickId: action.payload,
        mode: WorkshopModes.ADDING,
      };
    case 'CLEAR_SELECTED_BRICK':
      return { ...state, selectedBrickId: null };
    case 'CLOSE_BUCKET':
      return {
        ...state,
        showBucket: false,
        selectedBrickId: null,
        mode: WorkshopModes.NONE,
      };
    case 'SET_COLOR':
      return { ...state, color: action.payload };
    case 'TOGGLE_BUCKET':
      return { ...state, showBucket: action.payload };
    case 'TOGGLE_PALETTE':
      return { ...state, isPaletteOpen: action.payload };
    // Mutual exclusion: opening either toolbar panel (bucket / palette) closes
    // the other, so at most one is ever open -- mirrors the main game.
    case 'OPEN_EXCLUSIVE_PANEL': {
      const { panel, open } = action.payload || {};
      const next = { ...state, showBucket: false, isPaletteOpen: false };
      if (panel) {
        next[panel] = Boolean(open);
      }
      return next;
    }
    case 'SET_ACTIVE_CHALLENGE':
      return {
        ...state,
        activeChallenge: action.payload,
        challengeMatch: {
          matched: 0,
          total: action.payload?.targetInstances?.length ?? 0,
          complete: (action.payload?.targetInstances?.length ?? 0) === 0,
        },
      };
    case 'SET_CHALLENGE_MATCH':
      return { ...state, challengeMatch: action.payload };
    case 'CLEAR_ACTIVE_CHALLENGE':
      return {
        ...state,
        activeChallenge: null,
        challengeMatch: { matched: 0, total: 0, complete: false },
      };
    default:
      return state;
  }
};