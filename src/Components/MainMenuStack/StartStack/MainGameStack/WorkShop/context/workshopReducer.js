import { WorkshopModes } from '../WorkshopEngine/workshopModes';

export const initialWorkshopState = {
  mode: WorkshopModes.NONE,
  selectedBrickId: null,
  color: 'c91a09',
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
      return {
        ...state,
        selectedBrickId: action.payload,
        mode: action.payload ? WorkshopModes.ADDING : WorkshopModes.NONE,
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