import React, { useState } from 'react';
import styles from './Palette.module.css';
import { paletteColors } from './PaletteResourceStack/index';

const Palette = ({ handleColor }) => {
    const [activeIcon, setActiveIcon] = useState(null);
    const icons = [
        { passiveIcon: paletteColors.yellow[0], activeIcon: paletteColors.yellow[1], width: 42, height: 37, hex: 'E8D100' },
        { passiveIcon: paletteColors.beige[0], activeIcon: paletteColors.beige[1], width: 32, height: 44, hex: 'E0DB63' },
        { passiveIcon: paletteColors.brown[0], activeIcon: paletteColors.brown[1], width: 23, height: 48, hex: '613000' },
        { passiveIcon: paletteColors.orange[0], activeIcon: paletteColors.orange[1], width: 24, height: 50, hex: 'FF9002' },
        { passiveIcon: paletteColors.red[0], activeIcon: paletteColors.red[1], width: 37, height: 44, hex: 'D50001' },
        { passiveIcon: paletteColors.purple[0], activeIcon: paletteColors.purple[1], width: 45, height: 37, hex: '9A3186' },
        { passiveIcon: paletteColors.blue[0], activeIcon: paletteColors.blue[1], width: 51, height: 27, hex: '1629C6' },
        { passiveIcon: paletteColors.green[0], activeIcon: paletteColors.green[1], width: 53, height: 22, hex: '00794C' },
        { passiveIcon: paletteColors.gold[0], activeIcon: paletteColors.gold[1], width: 48, height: 34, hex: 'C6FD00' },
        { passiveIcon: paletteColors.darkGreen[0], activeIcon: paletteColors.darkGreen[1], width: 39, height: 44, hex: '0A8A00' },
        { passiveIcon: paletteColors.black[0], activeIcon: paletteColors.black[1], width: 28, height: 50, hex: '161B14' },
        { passiveIcon: paletteColors.gray[0], activeIcon: paletteColors.gray[1], width: 23, height: 51, hex: '83807A' },
        { passiveIcon: paletteColors.silver[0], activeIcon: paletteColors.silver[1], width: 28, height: 47, hex: '686557' },
        { passiveIcon: paletteColors.white[0], activeIcon: paletteColors.white[1], width: 39, height: 41, hex: 'F0EFE3' }
    ];

    const handlePaletteClick = (index) => {
        setActiveIcon(activeIcon === index ? null : index);
        handleColor(icons[index].hex);
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