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

  // Generate an array of angles in degrees for 14 positions around the circle
  const angles = Array.from({ length: numIcons }, (_, i) => (i * (360 / numIcons)));

  // Convert degrees to radians
  const toRadians = (degrees) => degrees * (Math.PI / 180);
  return (
    <div className={styles.paletteDiv}>
      {angles.map((angle, index) => {
        const x = centerX + radius * Math.cos(toRadians(angle));
        const y = centerY + radius * Math.sin(toRadians(angle));
        
        const { src, orientation } = icons[index];
        
        // Determine rotation based on orientation
        let rotation = 0;
        if (orientation === 'horizontal') {
          rotation = 90; // Rotate horizontal icons by 90 degrees to align
        }
        
        return (
          <img
            key={index}
            src={src}
            alt={`Icon ${index + 1}`}
            style={{
              position: 'absolute',
              left: `${x}px`,
              top: `${y}px`,
              width: '30px',  // Adjust size to match palette layout
              height: 'auto', // Maintain aspect ratio
              transform: `translate(-50%, -50%) rotate(${angle + rotation}deg)`, // Rotate icons
            }}
          />
        );
      })}
    </div>
  );
}

export default Palette;