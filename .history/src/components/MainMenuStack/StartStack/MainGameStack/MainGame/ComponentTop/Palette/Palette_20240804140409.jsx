import React from 'react';
import styles from './Palette.module.css';
import { paletteColors } from './PaletteResourceStack/index';

const Palette = () => {
    return (
        <div className={styles.paletteDiv}>
            {Object.keys(paletteColors).map((color, index) => (
                <div key={index} className={styles.colorDiv}>
                    <img src={paletteColors[color][0]} alt={color} />
                    <img src={paletteColors[color][1]} alt={color} />
                </div>
            ))}
        </div>
    );
}

export default Palette;