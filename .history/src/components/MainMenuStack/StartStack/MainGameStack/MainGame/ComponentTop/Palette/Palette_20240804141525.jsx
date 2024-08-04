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
    { src: paletteColors.red, orientation: 'vertical' },
    { src: paletteColors.orange, orientation: 'vertical' },
    { src: paletteColors.brown, orientation: 'vertical' },
    { src: paletteColors.yellow, orientation: 'horizontal' },
    { src: paletteColors.beige, orientation: 'vertical' },
    { src: paletteColors.gold, orientation: 'horizontal' },
    { src: paletteColors.green, orientation: 'horizontal' },
    { src: paletteColors.darkGreen, orientation: 'vertical' },
    { src: paletteColors.blue, orientation: 'horizontal' },
    { src: paletteColors.purple, orientation: 'horizontal' },
    { src: paletteColors.black, orientation: 'vertical' },
    { src: paletteColors.gray, orientation: 'vertical' },
    { src: paletteColors.silver, orientation: 'vertical' },
    { src: paletteColors.white, orientation: 'vertical' }
  ];

  // Generate an array of angles in degrees for 14 positions around the circle
  const angles = Array.from({ length: numIcons }, (_, i) => (i * (360 / numIcons)));

  // Convert degrees to radians
  const toRadians = (degrees) => degrees * (Math.PI / 180);
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