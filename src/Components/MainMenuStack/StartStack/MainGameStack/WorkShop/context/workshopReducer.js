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
    default:
      return state;
  }
};