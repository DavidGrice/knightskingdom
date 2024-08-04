import React from 'react';
import styles from './Palette.module.css';
import { paletteColors } from './PaletteResourceStack/index';

const Palette = () => {
    const icons = [
        { src: paletteColors.yellow[0], orientation: 'horizontal', width: 42, height: 37},
        { src: paletteColors.beige[0], orientation: 'vertical', width: 32, height: 44},
        { src: paletteColors.brown[0], orientation: 'vertical', width: 23, height: 48},
        { src: paletteColors.orange[0], orientation: 'vertical', width: 24, height: 50 },
        { src: paletteColors.red[0], orientation: 'vertical', width: 37, height: 44 },
        { src: paletteColors.purple[0], orientation: 'horizontal', width: 45, height: 37},
        { src: paletteColors.blue[0], orientation: 'horizontal', width: 51, height: 27},
        { src: paletteColors.green[0], orientation: 'horizontal', width: 53, height: 22},
        { src: paletteColors.gold[0], orientation: 'horizontal', width: 48, height: 34},
        { src: paletteColors.darkGreen[0], orientation: 'vertical', width: 39, height: 44},
        { src: paletteColors.black[0], orientation: 'vertical', width: 28, height: 50},
        { src: paletteColors.gray[0], orientation: 'vertical', width: 23, height: 51},
        { src: paletteColors.silver[0], orientation: 'vertical', width: 28, height: 47},
        { src: paletteColors.white[0], orientation: 'vertical', width: 39, height: 41}
    ];

    return (
        <div className={styles.paletteDiv}>
            {icons.map((icon, index) => (
                <img
                    key={index}
                    src={icon.src}
                    className={icon.orientation === 'vertical' ? styles.vertical : styles.horizontal}
                    alt={`icon-${index}`}
                />
            ))}
        </div>
    );
}

export default Palette;