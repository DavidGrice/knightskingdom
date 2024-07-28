import React, { useState } from 'react';
import styles from './ProfileIcon.module.css'; // Import the CSS file for styling

const ProfileIcon = ({ initialImage, initialText }) => {
  const [image, setImage] = useState(initialImage);
  const [text, setText] = useState(initialText);

  // Function to upgrade the image
  const upgradeImage = (newImage) => {
    setImage(newImage);
  };

  return (
    <div className={styles.profileIcon}>
      <img src={image} alt="Profile Icon" className={styles.profileImage} />
      <input
      type="text"
      className={styles.profileInput}
      value={text}
      max={33}
      onClick={() => setText('')}
      onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
};

export default ProfileIcon;