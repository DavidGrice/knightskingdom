import Background from './background.png';
import DropDown from './drop_down.png';
import CheckMark2 from './checkmark_2.png';
import CheckMark4 from './checkmark_4.png';
import Load2 from './load_2.png';
import Load3 from './load_3.png';
import Load4 from './load_4.png';
import Load5 from './load_5.png';
import Load7 from './load_7.png';
import Load8 from './load_8.png';
import ArrowUp2 from './purple_arrow_up_2.png';
import ArrowUp6 from './purple_arrow_up_6.png';
import ArrowDown2 from './purple_arrow_down_2.png';
import ArrowDown6 from './purple_arrow_down_6.png';
import SelectedOverlay from './load_2.png';

import PurpleHelp2 from './purple_richard_help_2.png';
import PurpleHelp3 from './purple_richard_help_3.png';
import PurpleHelp4 from './purple_richard_help_4.png';
import PurpleHelp5 from './purple_richard_help_5.png';
import PurpleHelp6 from './purple_richard_help_6.png';
import PurpleHelp7 from './purple_richard_help_7.png';
import PurpleHelp8 from './purple_richard_help_8.png';
import PurpleHelp9 from './purple_richard_help_9.png';
import PurpleHelp10 from './purple_richard_help_10.png';
import PurpleHelp11 from './purple_richard_help_11.png';
import PurpleHelp12 from './purple_richard_help_12.png';
import PurpleHelp13 from './purple_richard_help_13.png';
import PurpleHelp14 from './purple_richard_help_14.png';
import PurpleHelp15 from './purple_richard_help_15.png';
import PurpleHelp16 from './purple_richard_help_16.png';
import PurpleHelp17 from './purple_richard_help_17.png';
import PurpleHelp18 from './purple_richard_help_18.png';
import PurpleHelp19 from './purple_richard_help_19.png';
import PurpleHelp20 from './purple_richard_help_20.png';
import PurpleHelp21 from './purple_richard_help_21.png';

import PurpleCopy2 from './purple_copy_2.png';
import PurpleCopy3 from './purple_copy_3.png';
import PurpleCopy4 from './purple_copy_4.png';
import PurpleCopy5 from './purple_copy_5.png';
import PurpleCopy7 from './purple_copy_7.png';
import PurpleCopy8 from './purple_copy_8.png';
import PurpleCopy9 from './purple_copy_9.png';
import PurpleCopy10 from './purple_copy_10.png';
import PurpleCopy11 from './purple_copy_11.png';
import PurpleCopy12 from './purple_copy_12.png';
import PurpleCopy13 from './purple_copy_13.png';
import PurpleCopy14 from './purple_copy_14.png';
import PurpleCopy15 from './purple_copy_15.png';
import PurpleCopy16 from './purple_copy_16.png';
import PurpleCopy17 from './purple_copy_17.png';
import PurpleCopy18 from './purple_copy_18.png';
import PurpleCopy19 from './purple_copy_19.png';
import PurpleCopy20 from './purple_copy_20.png';
import PurpleCopy21 from './purple_copy_21.png';

import PurpleDelete2 from './purple_delete_2.png';
import PurpleDelete3 from './purple_delete_3.png';
import PurpleDelete4 from './purple_delete_4.png';
import PurpleDelete5 from './purple_delete_5.png';
import PurpleDelete7 from './purple_delete_7.png';
import PurpleDelete8 from './purple_delete_8.png';
import PurpleDelete9 from './purple_delete_9.png';
import PurpleDelete10 from './purple_delete_10.png';
import PurpleDelete11 from './purple_delete_11.png';
import PurpleDelete12 from './purple_delete_12.png';
import PurpleDelete13 from './purple_delete_13.png';
import PurpleDelete14 from './purple_delete_14.png';
import PurpleDelete15 from './purple_delete_15.png';
import PurpleDelete16 from './purple_delete_16.png';
import PurpleDelete17 from './purple_delete_17.png';

const helperFrames = [
  PurpleHelp2, PurpleHelp3, PurpleHelp4, PurpleHelp5, PurpleHelp6,
  PurpleHelp7, PurpleHelp8, PurpleHelp9, PurpleHelp10, PurpleHelp11,
  PurpleHelp12, PurpleHelp13, PurpleHelp14, PurpleHelp15, PurpleHelp16,
  PurpleHelp17, PurpleHelp18, PurpleHelp19, PurpleHelp20, PurpleHelp21,
];

const copyFrames = [
  PurpleCopy2, PurpleCopy3, PurpleCopy4, PurpleCopy5, PurpleCopy7,
  PurpleCopy8, PurpleCopy9, PurpleCopy10, PurpleCopy11, PurpleCopy12,
  PurpleCopy13, PurpleCopy14, PurpleCopy15, PurpleCopy16, PurpleCopy17,
  PurpleCopy18, PurpleCopy19, PurpleCopy20, PurpleCopy21,
];

const deleteFrames = [
  PurpleDelete2, PurpleDelete3, PurpleDelete4, PurpleDelete5, PurpleDelete7,
  PurpleDelete8, PurpleDelete9, PurpleDelete10, PurpleDelete11, PurpleDelete12,
  PurpleDelete13, PurpleDelete14, PurpleDelete15, PurpleDelete16, PurpleDelete17,
];

const loadPlaceholders = [Load2, Load3, Load4, Load5, Load7, Load8];

export const myModelsData = {
  background: Background,
  dropDown: DropDown,
  checkmarks: { passive: CheckMark2, active: CheckMark4 },
  upArrowGreen: ArrowUp2,
  upArrowGold: ArrowUp6,
  downArrowGreen: ArrowDown2,
  downArrowGold: ArrowDown6,
  selectedOverlay: SelectedOverlay,
  placeholderHelper: PurpleHelp2,
  helperFrames,
  copyPlaceholder: PurpleCopy2,
  copyFrames,
  deletePlaceholder: PurpleDelete2,
  deleteFrames,
  loadPlaceholders,
  emptySlotImage: Load2,
};