import React from 'react';
import styles from './Palette.module.css';
import { paletteColors } from './PaletteResourceStack/index';

const Palette = () => {
    const icons = [
        { src: paletteColors.red[0], orientation: 'vertical', width: 37, height: 44 },
        { src: paletteColors.orange[0], orientation: 'vertical', width: 24, height: 50 },
        { src: paletteColors.brown[0], orientation: 'vertical' },
        { src: paletteColors.yellow[0], orientation: 'horizontal' },
        { src: paletteColors.beige[0], orientation: 'vertical' },
        { src: paletteColors.gold[0], orientation: 'horizontal' },
        { src: paletteColors.green[0], orientation: 'horizontal' },
        { src: paletteColors.darkGreen[0], orientation: 'vertical' },
        { src: paletteColors.blue[0], orientation: 'horizontal' },
        { src: paletteColors.purple[0], orientation: 'horizontal' },
        { src: paletteColors.black[0], orientation: 'vertical' },
        { src: paletteColors.gray[0], orientation: 'vertical' },
        { src: paletteColors.silver[0], orientation: 'vertical' },
        { src: paletteColors.white[0], orientation: 'vertical' }
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