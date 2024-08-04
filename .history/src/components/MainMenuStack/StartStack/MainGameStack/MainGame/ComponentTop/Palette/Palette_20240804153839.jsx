import React, { useState } from 'react';
import styles from './Palette.module.css';
import { paletteColors } from './PaletteResourceStack/index';

const Palette = () => {
    const [activeIcon, setActiveIcon] = useState(null);
    const icons = [
        { passiveIcon: paletteColors.yellow[0], activeIcon:paletteColors.yellow[1], orientation: 'horizontal', width: 42, height: 37 },
        { passiveIcon: paletteColors.beige[0], activeIcon:paletteColors.beige[1], orientation: 'vertical', width: 32, height: 44 },
        { passiveIcon: paletteColors.brown[0], activeIcon:paletteColors.brown[1], orientation: 'vertical', width: 23, height: 48 },
        { passiveIcon: paletteColors.orange[0], activeIcon:paletteColors.orange[1], orientation: 'vertical', width: 24, height: 50 },
        { passiveIcon: paletteColors.red[0], activeIcon:paletteColors.red[1], orientation: 'vertical', width: 37, height: 44 },
        { passiveIcon: paletteColors.purple[0], activeIcon:paletteColors.purple[1], orientation: 'horizontal', width: 45, height: 37 },
        { passiveIcon: paletteColors.blue[0], activeIcon:paletteColors.blue[1], orientation: 'horizontal', width: 51, height: 27 },
        { passiveIcon: paletteColors.green[0], activeIcon:paletteColors.green[1], orientation: 'horizontal', width: 53, height: 22 },
        { passiveIcon: paletteColors.gold[0], activeIcon:paletteColors.gold[1], orientation: 'horizontal', width: 48, height: 34 },
        { passiveIcon: paletteColors.darkGreen[0], activeIcon:paletteColors.darkGreen[1], orientation: 'vertical', width: 39, height: 44 },
        { passiveIcon: paletteColors.black[0], activeIcon:paletteColors.black[1], orientation: 'vertical', width: 28, height: 50 },
        { passiveIcon: paletteColors.gray[0], activeIcon:paletteColors.gray[1], orientation: 'vertical', width: 23, height: 51 },
        { passiveIcon: paletteColors.silver[0], activeIcon:paletteColors.silver[1], orientation: 'vertical', width: 28, height: 47 },
        { passiveIcon: paletteColors.white[0], activeIcon:paletteColors.white[1], orientation: 'vertical', width: 39, height: 41 }
    ];

    const handlePaletteClick = (index) => {
        setActiveIcon(index);
    };

    return (
        <div className={styles.paletteDiv}>
            {icons.map((icon, index) => (
                <img
                    key={index}
                    src={icon.passiveIcon}
                    alt={`icon-${index}`}
                    className={`${styles.icon} ${styles[`icon-${index}`]}`}
                    style={{ width: `${icon.width}px`, height: `${icon.height}px` }}
                />
            ))}
        </div>
    );
}

export default Palette;