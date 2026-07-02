import React from 'react';
import CommonComponent from '../CommonComponent/CommonComponent';
import Checkmark2 from '../../MainMenuStack/Options/OptionsResourceStack/checkmark_2.png';
import Checkmark4 from '../../MainMenuStack/Options/OptionsResourceStack/checkmark_4.png';

const BackCheckmarkButton = ({ onClick, altText = 'Confirm' }) => (
  <CommonComponent
    initialImage={Checkmark2}
    hoverImage={Checkmark4}
    altText={altText}
    onClick={onClick}
  />
);

export default BackCheckmarkButton;