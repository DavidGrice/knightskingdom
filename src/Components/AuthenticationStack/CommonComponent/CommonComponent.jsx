// Create this component which is passed in a string and based upon the value pull two images for a static and on hover effect.
// 
// Task: Create a new component named CommonComponent inside the CommonComponent.jsx file. The component should take the following props:
// 
// initialImage: A string representing the URL of an image to be displayed initially.
// hoverImage: A string representing the URL of an image to be displayed on hover.
// altText: A string representing the alt text for the image.
// 
// The component should render an img element with the following attributes:
// 
// src: Set to the value of the initialImage prop.
// alt: Set to the value of the altText prop.
// onMouseOver: Set to a function that changes the src attribute to the value of the hoverImage prop.
// onMouseOut: Set to a function that changes the src attribute back to the value of the initialImage prop.
// 
// The component should be exported as the default export of the file.
// 
// Note: You can ignore the CSS import and the className attribute for now. Just focus on implementing the functionality described above.

import React, { useState } from 'react';
import styles from './CommonComponent.module.css';

const CommonComponent = ({ initialImage, hoverImage, altText }) => {
  const [image, setImage] = useState(initialImage);

  return (
    <img
      src={image}
      alt={altText}
      onMouseOver={() => setImage(hoverImage)}
      onMouseOut={() => setImage(initialImage)}
    />
  );
};

export default CommonComponent;