import React from 'react';
import styles from './ProfileIcon.module.css'; // Import the CSS file for styling

const ProfileIcon = ({ image }) => {


  return (
    <div className={styles.profileIcon} >
      <img src={image} alt="Profile Icon" className={styles.profileImage} />
    </div>
  );
};

export default ProfileIcon;