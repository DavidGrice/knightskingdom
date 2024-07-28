import React, { useState } from 'react';
import styles from './ProfileInput.module.css'; // Import the CSS file for styling

const ProfileInput = ({ text, setText, setShowEnterNameImage, isPopulated, handleAddProfile, setSelectedProfile }) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleClick = () => {
    if (isSelected) {
      // Proceed to move forward
      console.log('Profile selected:', text);
      // Add your logic to move forward here
    } else {
      setShowEnterNameImage(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Update the profile data here
      console.log('Profile name updated to:', text);
      setShowEnterNameImage(false);
      setText(text);
      handleAddProfile(text);
      setIsSelected(true); // Set isSelected to true
      setSelectedProfile(true)
    }
  };

  return (
    <div onClick={handleClick}>
      {isPopulated ? (
        <input
          className={styles.profileInput}
          type="text"
          value={text}
          maxLength={33}
          disabled={true}
        />
      ) : (
        <input
          className={styles.profileInput}
          type="text"
          value={text}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          maxLength={33}
        />
      )}
    </div>
  );
};

export default ProfileInput;