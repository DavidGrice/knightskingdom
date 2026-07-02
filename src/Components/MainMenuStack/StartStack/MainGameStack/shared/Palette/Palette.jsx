import React, { useState } from 'react';
import gameStyles from './Palette.game.module.css';
import workshopStyles from './Palette.workshop.module.css';
import { getPaletteConfig } from '../toolbarConfig';

const Palette = ({ variant = 'game', onColorSelect }) => {
    const styles = variant === 'workshop' ? workshopStyles : gameStyles;
    const { icons } = getPaletteConfig(variant);
    const [activeIcon, setActiveIcon] = useState(null);

    const handlePaletteClick = (index) => {
        setActiveIcon(activeIcon === index ? null : index);
        if (onColorSelect && icons[index].hex) {
            onColorSelect(icons[index].hex);
        }
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
};

export default Palette;