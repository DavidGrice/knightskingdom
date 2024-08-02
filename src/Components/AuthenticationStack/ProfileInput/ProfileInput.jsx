import React, { useState, useRef } from 'react';
import styles from './ProfileInput.module.css'; // Import the CSS file for styling

const ProfileInput = ({ text, setText, setShowEnterNameImage, handleAddProfile, setSelectedProfile }) => {
  const [isSelected, setIsSelected] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleClick = () => {
      setShowEnterNameImage(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log('Profile name updated to:', text);
      setShowEnterNameImage(false);
      setText('');
      handleAddProfile(text);
      setIsSelected(true);
      setSelectedProfile(true);
      inputRef.current.blur();
    }
  };

  return (
    <div onClick={handleClick}>
      <input
        ref={inputRef}
        className={styles.profileInput}
        type="text"
        value={text}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        maxLength={33}
      />
    </div>
  );
};

export default ProfileInput;