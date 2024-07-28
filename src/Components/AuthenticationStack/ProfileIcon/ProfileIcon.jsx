import React, { useState } from 'react';
import styles from './ProfileIcon.module.css'; // Import the CSS file for styling
import { ProfileInput } from '..';

const ProfileIcon = ({ image, setShowEnterNameImage, name, isPopulated, handleAddProfile, setSelectedProfile}) => {
  const [text, setText] = useState(name);

  return (
    <div className={styles.profileIcon} >
      <img src={image} alt="Profile Icon" className={styles.profileImage} />
      <ProfileInput
        text={text}
        setText={setText}
        setShowEnterNameImage={setShowEnterNameImage}
        isPopulated={isPopulated}
        handleAddProfile={handleAddProfile}
        setSelectedProfile={setSelectedProfile}
      />
    </div>
  );
};

export default ProfileIcon;