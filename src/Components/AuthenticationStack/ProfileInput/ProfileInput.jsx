import React, { useRef } from 'react';
import { AUTH_NAME_MAX_LENGTH } from '../../Common/MenuStageLayout/authLayoutContract';
import containerStyles from '../ProfileContainer/ProfileContainer.module.css';
import styles from './ProfileInput.module.css';

const clampName = (value) => value.slice(0, AUTH_NAME_MAX_LENGTH);

const ProfileInput = ({ text, setText, setShowEnterNameImage, handleAddProfile }) => {
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    setText(clampName(e.target.value));
  };

  const handleClick = (e) => {
    e.stopPropagation();
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
        className={`${containerStyles.nameText} ${styles.profileInput}`}
        type="text"
        value={text}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        maxLength={AUTH_NAME_MAX_LENGTH}
        aria-label="New profile name"
        data-testid="profile-name-input"
      />
    </div>
  );
};

export default ProfileInput;