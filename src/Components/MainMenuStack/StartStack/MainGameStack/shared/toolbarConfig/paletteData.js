import { paletteColors as gamePaletteColors } from '../../MainGame/ComponentTop/Palette/PaletteResourceStack/index';
import { paletteColors as workshopPaletteColors } from '../../WorkShop/ComponentTop/Palette/PaletteResourceStack/index';
import { PAINT_COLORS, WORKSHOP_PASTELS } from './authenticPalette';

const gamePaletteIcons = [
    { passiveIcon: gamePaletteColors.yellow[0], activeIcon: gamePaletteColors.yellow[1], width: 42, height: 37, hex: PAINT_COLORS.yellow },
    { passiveIcon: gamePaletteColors.beige[0], activeIcon: gamePaletteColors.beige[1], width: 32, height: 44, hex: PAINT_COLORS.beige },
    { passiveIcon: gamePaletteColors.brown[0], activeIcon: gamePaletteColors.brown[1], width: 23, height: 48, hex: PAINT_COLORS.brown },
    { passiveIcon: gamePaletteColors.orange[0], activeIcon: gamePaletteColors.orange[1], width: 24, height: 50, hex: PAINT_COLORS.orange },
    { passiveIcon: gamePaletteColors.red[0], activeIcon: gamePaletteColors.red[1], width: 37, height: 44, hex: PAINT_COLORS.red },
    { passiveIcon: gamePaletteColors.purple[0], activeIcon: gamePaletteColors.purple[1], width: 45, height: 37, hex: PAINT_COLORS.purple },
    { passiveIcon: gamePaletteColors.blue[0], activeIcon: gamePaletteColors.blue[1], width: 51, height: 27, hex: PAINT_COLORS.blue },
    { passiveIcon: gamePaletteColors.green[0], activeIcon: gamePaletteColors.green[1], width: 53, height: 22, hex: PAINT_COLORS.green },
    { passiveIcon: gamePaletteColors.gold[0], activeIcon: gamePaletteColors.gold[1], width: 48, height: 34, hex: PAINT_COLORS.gold },
    { passiveIcon: gamePaletteColors.darkGreen[0], activeIcon: gamePaletteColors.darkGreen[1], width: 39, height: 44, hex: PAINT_COLORS.darkGreen },
    { passiveIcon: gamePaletteColors.black[0], activeIcon: gamePaletteColors.black[1], width: 28, height: 50, hex: PAINT_COLORS.black },
    { passiveIcon: gamePaletteColors.gray[0], activeIcon: gamePaletteColors.gray[1], width: 23, height: 51, hex: PAINT_COLORS.gray },
    { passiveIcon: gamePaletteColors.silver[0], activeIcon: gamePaletteColors.silver[1], width: 28, height: 47, hex: PAINT_COLORS.silver },
    { passiveIcon: gamePaletteColors.white[0], activeIcon: gamePaletteColors.white[1], width: 39, height: 41, hex: PAINT_COLORS.white },
];

// The 14 large workshop splats are the same original art as the game's 14
// (identical sizes, different label names) -- same authentic colours. The
// hex fields also make the workshop palette actually select colours:
// Palette.jsx only fires onColorSelect when an icon has one, so these
// entries were silently dead before.
const workshopPaletteIcons = [
    { passiveIcon: workshopPaletteColors.gold[0], activeIcon: workshopPaletteColors.gold[1], width: 42, height: 37, hex: PAINT_COLORS.yellow },
    { passiveIcon: workshopPaletteColors.beige[0], activeIcon: workshopPaletteColors.beige[1], width: 32, height: 44, hex: PAINT_COLORS.beige },
    { passiveIcon: workshopPaletteColors.darkBrown[0], activeIcon: workshopPaletteColors.darkBrown[1], width: 23, height: 48, hex: PAINT_COLORS.brown },
    { passiveIcon: workshopPaletteColors.lightOrange[0], activeIcon: workshopPaletteColors.lightOrange[1], width: 24, height: 50, hex: PAINT_COLORS.orange },
    { passiveIcon: workshopPaletteColors.darkRed[0], activeIcon: workshopPaletteColors.darkRed[1], width: 37, height: 44, hex: PAINT_COLORS.red },
    { passiveIcon: workshopPaletteColors.darkPurple[0], activeIcon: workshopPaletteColors.darkPurple[1], width: 45, height: 37, hex: PAINT_COLORS.purple },
    { passiveIcon: workshopPaletteColors.darkBlue[0], activeIcon: workshopPaletteColors.darkBlue[1], width: 51, height: 27, hex: PAINT_COLORS.blue },
    { passiveIcon: workshopPaletteColors.forestGreen[0], activeIcon: workshopPaletteColors.forestGreen[1], width: 53, height: 22, hex: PAINT_COLORS.green },
    { passiveIcon: workshopPaletteColors.yellow[0], activeIcon: workshopPaletteColors.yellow[1], width: 48, height: 34, hex: PAINT_COLORS.gold },
    { passiveIcon: workshopPaletteColors.magicalGreen[0], activeIcon: workshopPaletteColors.magicalGreen[1], width: 39, height: 44, hex: PAINT_COLORS.darkGreen },
    { passiveIcon: workshopPaletteColors.black[0], activeIcon: workshopPaletteColors.black[1], width: 28, height: 50, hex: PAINT_COLORS.black },
    { passiveIcon: workshopPaletteColors.silver[0], activeIcon: workshopPaletteColors.silver[1], width: 23, height: 51, hex: PAINT_COLORS.gray },
    { passiveIcon: workshopPaletteColors.darkGray[0], activeIcon: workshopPaletteColors.darkGray[1], width: 28, height: 47, hex: PAINT_COLORS.silver },
    { passiveIcon: workshopPaletteColors.white[0], activeIcon: workshopPaletteColors.white[1], width: 39, height: 41, hex: PAINT_COLORS.white },
    { passiveIcon: workshopPaletteColors.lightWhite[0], activeIcon: workshopPaletteColors.lightWhite[1], width: 28, height: 17, hex: WORKSHOP_PASTELS.lightWhite },
    { passiveIcon: workshopPaletteColors.lightGreen[0], activeIcon: workshopPaletteColors.lightGreen[1], width: 28, height: 18, hex: WORKSHOP_PASTELS.lightGreen },
    { passiveIcon: workshopPaletteColors.lightYellow[0], activeIcon: workshopPaletteColors.lightYellow[1], width: 19, height: 26, hex: WORKSHOP_PASTELS.lightYellow },
    { passiveIcon: workshopPaletteColors.lightMajGreen[0], activeIcon: workshopPaletteColors.lightMajGreen[1], width: 21, height: 26, hex: WORKSHOP_PASTELS.lightMajGreen },
    { passiveIcon: workshopPaletteColors.lightBlue[0], activeIcon: workshopPaletteColors.lightBlue[1], width: 23, height: 25, hex: WORKSHOP_PASTELS.lightBlue },
    { passiveIcon: workshopPaletteColors.lightPurple[0], activeIcon: workshopPaletteColors.lightPurple[1], width: 23, height: 28, hex: WORKSHOP_PASTELS.lightPurple },
    { passiveIcon: workshopPaletteColors.lightRed[0], activeIcon: workshopPaletteColors.lightRed[1], width: 16, height: 28, hex: WORKSHOP_PASTELS.lightRed },
    { passiveIcon: workshopPaletteColors.lightBrown[0], activeIcon: workshopPaletteColors.lightBrown[1], width: 16, height: 26, hex: WORKSHOP_PASTELS.lightBrown },
];

export const getPaletteConfig = (variant) => ({
    icons: variant === 'workshop' ? workshopPaletteIcons : gamePaletteIcons,
    iconCount: variant === 'workshop' ? 22 : 14,
});