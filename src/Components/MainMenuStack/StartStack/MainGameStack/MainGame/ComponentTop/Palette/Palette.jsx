import React from 'react';
import { Palette as SharedPalette } from '../../../shared';

const Palette = ({ handleColor, ...props }) => (
    <SharedPalette variant="game" onColorSelect={handleColor} {...props} />
);

export default Palette;