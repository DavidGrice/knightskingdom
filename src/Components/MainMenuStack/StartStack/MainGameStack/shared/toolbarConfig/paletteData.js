import { paletteColors as gamePaletteColors } from '../../MainGame/ComponentTop/Palette/PaletteResourceStack/index';
import { paletteColors as workshopPaletteColors } from '../../WorkShop/ComponentTop/Palette/PaletteResourceStack/index';

const gamePaletteIcons = [
    { passiveIcon: gamePaletteColors.yellow[0], activeIcon: gamePaletteColors.yellow[1], width: 42, height: 37, hex: 'E8D100' },
    { passiveIcon: gamePaletteColors.beige[0], activeIcon: gamePaletteColors.beige[1], width: 32, height: 44, hex: 'E0DB63' },
    { passiveIcon: gamePaletteColors.brown[0], activeIcon: gamePaletteColors.brown[1], width: 23, height: 48, hex: '613000' },
    { passiveIcon: gamePaletteColors.orange[0], activeIcon: gamePaletteColors.orange[1], width: 24, height: 50, hex: 'FF9002' },
    { passiveIcon: gamePaletteColors.red[0], activeIcon: gamePaletteColors.red[1], width: 37, height: 44, hex: 'D50001' },
    { passiveIcon: gamePaletteColors.purple[0], activeIcon: gamePaletteColors.purple[1], width: 45, height: 37, hex: '9A3186' },
    { passiveIcon: gamePaletteColors.blue[0], activeIcon: gamePaletteColors.blue[1], width: 51, height: 27, hex: '1629C6' },
    { passiveIcon: gamePaletteColors.green[0], activeIcon: gamePaletteColors.green[1], width: 53, height: 22, hex: '00794C' },
    { passiveIcon: gamePaletteColors.gold[0], activeIcon: gamePaletteColors.gold[1], width: 48, height: 34, hex: 'C6FD00' },
    { passiveIcon: gamePaletteColors.darkGreen[0], activeIcon: gamePaletteColors.darkGreen[1], width: 39, height: 44, hex: '0A8A00' },
    { passiveIcon: gamePaletteColors.black[0], activeIcon: gamePaletteColors.black[1], width: 28, height: 50, hex: '161B14' },
    { passiveIcon: gamePaletteColors.gray[0], activeIcon: gamePaletteColors.gray[1], width: 23, height: 51, hex: '83807A' },
    { passiveIcon: gamePaletteColors.silver[0], activeIcon: gamePaletteColors.silver[1], width: 28, height: 47, hex: '686557' },
    { passiveIcon: gamePaletteColors.white[0], activeIcon: gamePaletteColors.white[1], width: 39, height: 41, hex: 'F0EFE3' },
];

const workshopPaletteIcons = [
    { passiveIcon: workshopPaletteColors.gold[0], activeIcon: workshopPaletteColors.gold[1], width: 42, height: 37 },
    { passiveIcon: workshopPaletteColors.beige[0], activeIcon: workshopPaletteColors.beige[1], width: 32, height: 44 },
    { passiveIcon: workshopPaletteColors.darkBrown[0], activeIcon: workshopPaletteColors.darkBrown[1], width: 23, height: 48 },
    { passiveIcon: workshopPaletteColors.lightOrange[0], activeIcon: workshopPaletteColors.lightOrange[1], width: 24, height: 50 },
    { passiveIcon: workshopPaletteColors.darkRed[0], activeIcon: workshopPaletteColors.darkRed[1], width: 37, height: 44 },
    { passiveIcon: workshopPaletteColors.darkPurple[0], activeIcon: workshopPaletteColors.darkPurple[1], width: 45, height: 37 },
    { passiveIcon: workshopPaletteColors.darkBlue[0], activeIcon: workshopPaletteColors.darkBlue[1], width: 51, height: 27 },
    { passiveIcon: workshopPaletteColors.forestGreen[0], activeIcon: workshopPaletteColors.forestGreen[1], width: 53, height: 22 },
    { passiveIcon: workshopPaletteColors.yellow[0], activeIcon: workshopPaletteColors.yellow[1], width: 48, height: 34 },
    { passiveIcon: workshopPaletteColors.magicalGreen[0], activeIcon: workshopPaletteColors.magicalGreen[1], width: 39, height: 44 },
    { passiveIcon: workshopPaletteColors.black[0], activeIcon: workshopPaletteColors.black[1], width: 28, height: 50 },
    { passiveIcon: workshopPaletteColors.silver[0], activeIcon: workshopPaletteColors.silver[1], width: 23, height: 51 },
    { passiveIcon: workshopPaletteColors.darkGray[0], activeIcon: workshopPaletteColors.darkGray[1], width: 28, height: 47 },
    { passiveIcon: workshopPaletteColors.white[0], activeIcon: workshopPaletteColors.white[1], width: 39, height: 41 },
    { passiveIcon: workshopPaletteColors.lightWhite[0], activeIcon: workshopPaletteColors.lightWhite[1], width: 28, height: 17 },
    { passiveIcon: workshopPaletteColors.lightGreen[0], activeIcon: workshopPaletteColors.lightGreen[1], width: 28, height: 18 },
    { passiveIcon: workshopPaletteColors.lightYellow[0], activeIcon: workshopPaletteColors.lightYellow[1], width: 19, height: 26 },
    { passiveIcon: workshopPaletteColors.lightMajGreen[0], activeIcon: workshopPaletteColors.lightMajGreen[1], width: 21, height: 26 },
    { passiveIcon: workshopPaletteColors.lightBlue[0], activeIcon: workshopPaletteColors.lightBlue[1], width: 23, height: 25 },
    { passiveIcon: workshopPaletteColors.lightPurple[0], activeIcon: workshopPaletteColors.lightPurple[1], width: 23, height: 28 },
    { passiveIcon: workshopPaletteColors.lightRed[0], activeIcon: workshopPaletteColors.lightRed[1], width: 16, height: 28 },
    { passiveIcon: workshopPaletteColors.lightBrown[0], activeIcon: workshopPaletteColors.lightBrown[1], width: 16, height: 26 },
];

export const getPaletteConfig = (variant) => ({
    icons: variant === 'workshop' ? workshopPaletteIcons : gamePaletteIcons,
    iconCount: variant === 'workshop' ? 22 : 14,
});