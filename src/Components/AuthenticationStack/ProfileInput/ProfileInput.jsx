import React, { useRef } from 'react';
import styles from './ProfileInput.module.css';

const ProfileInput = ({ text, setText, setShowEnterNameImage, handleAddProfile }) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setText(e.target.value);
  };

  const handleClick = () => {
    setShowEnterNameImage(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      setShowEnterNameImage(false);
      setText('');
      handleAddProfile(trimmed);
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
        onKeyDown={handleKeyDown}
        maxLength={33}
      />
    </div>
  );
};

export default ProfileInput;