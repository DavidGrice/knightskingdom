import React from 'react';
import styles from './Palette.module.css';
import { paletteColors } from './PaletteResourceStack/index';

const Palette = () => {
    const numIcons = 14;
    const radius = 100; // Adjust as needed to fit your palette
    const centerX = 150; // Center of the palette
    const centerY = 150; // Center of the palette
  
    // List of icon images and their orientations
    const icons = [
      { src: paletteColors.red[0], orientation: 'vertical' },
      { src: paletteColors.orange[0], orientation: 'vertical' },
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
      </div>
    );
}

export default Palette;