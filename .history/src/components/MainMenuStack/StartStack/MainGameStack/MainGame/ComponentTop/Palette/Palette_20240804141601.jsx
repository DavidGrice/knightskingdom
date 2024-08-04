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
    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
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