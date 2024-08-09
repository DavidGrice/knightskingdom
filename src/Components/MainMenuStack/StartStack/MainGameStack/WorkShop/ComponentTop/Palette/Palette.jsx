import React, { useState } from 'react';
import styles from './Palette.module.css';
import { paletteColors } from './PaletteResourceStack/index';

const Palette = () => {
    const [activeIcon, setActiveIcon] = useState(null);
    const icons = [
        { passiveIcon: paletteColors.gold[0], activeIcon: paletteColors.gold[1], orientation: 'horizontal', width: 42, height: 37 },
        { passiveIcon: paletteColors.beige[0], activeIcon: paletteColors.beige[1], orientation: 'vertical', width: 32, height: 44 },
        { passiveIcon: paletteColors.darkBrown[0], activeIcon: paletteColors.darkBrown[1], orientation: 'vertical', width: 23, height: 48 },
        { passiveIcon: paletteColors.lightOrange[0], activeIcon: paletteColors.lightOrange[1], orientation: 'vertical', width: 24, height: 50 },
        { passiveIcon: paletteColors.darkRed[0], activeIcon: paletteColors.darkRed[1], orientation: 'horizontal', width: 37, height: 44 },
        { passiveIcon: paletteColors.darkPurple[0], activeIcon: paletteColors.darkPurple[1], orientation: 'horizontal', width: 45, height: 37 },
        { passiveIcon: paletteColors.darkBlue[0], activeIcon: paletteColors.darkBlue[1], orientation: 'horizontal', width: 51, height: 27 },
        { passiveIcon: paletteColors.forestGreen[0], activeIcon: paletteColors.forestGreen[1], orientation: 'horizontal', width: 53, height: 22 },
        { passiveIcon: paletteColors.yellow[0], activeIcon: paletteColors.yellow[1], orientation: 'horizontal', width: 48, height: 34 },
        { passiveIcon: paletteColors.magicalGreen[0], activeIcon: paletteColors.magicalGreen[1], orientation: 'horizontal', width: 39, height: 44 },
        { passiveIcon: paletteColors.black[0], activeIcon: paletteColors.black[1], orientation: 'vertical', width: 28, height: 50 },
        { passiveIcon: paletteColors.silver[0], activeIcon: paletteColors.silver[1], orientation: 'vertical', width: 23, height: 51 },
        { passiveIcon: paletteColors.darkGray[0], activeIcon: paletteColors.darkGray[1], orientation: 'vertical', width: 28, height: 47 },
        { passiveIcon: paletteColors.white[0], activeIcon: paletteColors.white[1], orientation: 'vertical', width: 39, height: 41 },
        { passiveIcon: paletteColors.lightWhite[0], activeIcon: paletteColors.lightWhite[1], orientation: 'horizontal', width: 28, height: 17 },
        { passiveIcon: paletteColors.lightGreen[0], activeIcon: paletteColors.lightGreen[1], orientation: 'horizontal', width: 28, height: 18 },
        { passiveIcon: paletteColors.lightYellow[0], activeIcon: paletteColors.lightYellow[1], orientation: 'horizontal', width: 19, height: 26 },
        { passiveIcon: paletteColors.lightMajGreen[0], activeIcon: paletteColors.lightMajGreen[1], orientation: 'horizontal', width: 21, height: 26 },
        { passiveIcon: paletteColors.lightBlue[0], activeIcon: paletteColors.lightBlue[1], orientation: 'horizontal', width: 23, height: 25 },
        { passiveIcon: paletteColors.lightPurple[0], activeIcon: paletteColors.lightPurple[1], orientation: 'horizontal', width: 23, height: 28 },
        { passiveIcon: paletteColors.lightRed[0], activeIcon: paletteColors.lightRed[1], orientation: 'vertical', width: 16, height: 28 },
        { passiveIcon: paletteColors.lightBrown[0], activeIcon: paletteColors.lightBrown[1], orientation: 'horizontal', width: 16, height: 26 },
    ];

    const handlePaletteClick = (index) => {
        setActiveIcon(activeIcon === index ? null : index);
    };

    return (
        <div className={styles.paletteDiv}>
            {icons.map((icon, index) => (
                <img
                    key={index}
                    src={activeIcon === index ? icon.activeIcon : icon.passiveIcon}
                    alt={`icon-${index}`}
                    className={`${styles.icon} ${styles[`icon-${index}`]}`}
                    style={{ width: `${icon.width}px`, height: `${icon.height}px` }}
                    onClick={() => handlePaletteClick(index)}
                />
            ))}
        </div>
    );
}

export default Palette;