import React, { useState } from 'react';
import { ProfileIcon, ProfileInput } from '..';
import EnterNameHereImage from '../AuthStackResources/text-updated.png';
import styles from './ProfileContainer.module.css';

import Page2 from '../AuthStackResources/page_2.png';
import Page4 from '../AuthStackResources/page_4.png';
import Knight2 from '../AuthStackResources/knight_2.png';
import Knight4 from '../AuthStackResources/knight_4.png';
import Baronet2 from '../AuthStackResources/baronet_2.png';
import Baronet4 from '../AuthStackResources/baronet_4.png';

const ProfileContainer = ({ name, level, isSelected, onClick, isNewProfile, setSelectedProfile, handleProfileSelect, newData, setNewData }) => {
    const [showEnterNameImage, setShowEnterNameImage] = useState(false);
    const [text, setText] = useState(name);

    const handleAddProfile = (name) => {
      setNewData([...newData, 
        {
          id: newData.length + 1,
          name: name,
          level: "page",
        }]);
      handleProfileSelect(name);
    };
  
    // Function to determine which profile image to display
    const getProfileImage = (level, isSelected) => {
      switch (level) {
        case 'page':
          return isSelected ? Page4 : Page2;
        case 'knight':
          return isSelected ? Knight4 : Knight2;
        case 'baronet':
          return isSelected ? Baronet4 : Baronet2;
        default:
          return isSelected ? Page4 : Page2;
      }
    };
  
    const profileImage = getProfileImage(level, isSelected);
  
    return (
      <div className={styles.profileContainer} onClick={onClick}>
        <div className={styles.profileInput}>
          <ProfileIcon
            image={profileImage}
          />
          {isNewProfile ? (<ProfileInput
            text={text}
            setText={setText}
            setShowEnterNameImage={setShowEnterNameImage}
            handleAddProfile={handleAddProfile}
            setSelectedProfile={setSelectedProfile}
          />
          ) : (
            <div className={styles.profileDiv}>{text}</div>
          )}
        </div>
        {showEnterNameImage ? (
        <img className={styles.enterNameImage} src= {EnterNameHereImage} alt="Enter Name" />
      ) : null}
      </div>
    );
  };
  
  export default ProfileContainer;