import React, { useState } from 'react';
import { ProfileIcon, ProfileInput } from '..';
import EnterNameHereImage from '../AuthStackResources/text-updated.png';
import styles from './ProfileContainer.module.css'; // Import the CSS file for styling

import Page1 from '../AuthStackResources/page_1.png';
import Page4 from '../AuthStackResources/page_4.png';
import Knight1 from '../AuthStackResources/knight_1.png';
import Knight4 from '../AuthStackResources/knight_4.png';
import Baronet1 from '../AuthStackResources/baronet_1.png';
import Baronet4 from '../AuthStackResources/baronet_4.png';

const ProfileContainer = ({ name, level, isSelected, onClick, isPopulated, setIsPopulated, setSelectedProfile, handleProfileSelect }) => {
    // const [showEnterNameImage, setShowEnterNameImage] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [text, setText] = useState('');
    const [showEnterNameImage, setShowEnterNameImage] = useState(false);
    // const [isPopulated, setIsPopulated] = useState(isPopulated);

    const handleAddProfile = (newProfile) => {
        setProfiles([...profiles, newProfile]);
        setIsPopulated(true); // Set isPopulated to true after adding a profile
        handleProfileSelect(newProfile);
      };
  
    // Function to determine which profile image to display
    const getProfileImage = (imageType, isSelected) => {
      switch (imageType) {
        case 'page':
          return isSelected ? Page4 : Page1;
        case 'knight':
          return isSelected ? Knight4 : Knight1;
        case 'baronet':
          return isSelected ? Baronet4 : Baronet1;
        default:
          return isSelected ? Page4 : Page1;
      }
    };
  
    const profileImage = getProfileImage(level, isSelected);
  
    return (
      <div className={styles.profileContainer} onClick={onClick}>
        <ProfileIcon
          image={profileImage}
          setShowEnterNameImage={setShowEnterNameImage}
          name={name}
          isPopulated={isPopulated}
          handleAddProfile={handleAddProfile}
          setSelectedProfile={setSelectedProfile}
        />
        {showEnterNameImage ? (
        <img className={styles.enterNameImage} src= {EnterNameHereImage} alt="Enter Name" />
      ) : null}
      </div>
    );
  };
  
  export default ProfileContainer;