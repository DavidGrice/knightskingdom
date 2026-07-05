import { WorkshopModes } from '../WorkshopEngine/workshopModes';

export const initialWorkshopState = {
  mode: WorkshopModes.NONE,
  selectedBrickId: null,
  color: 'eac000', // authentic LEGO yellow (palette glit018) -- the default brick colour
  showBucket: false,
  isPaletteOpen: false,
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
    default:
      return state;
  }
};