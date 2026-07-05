import React, { useState } from 'react';
import { ProfileInput } from '..';
import { defaultProfileOptions } from '../../../api';
import EnterNameHereImage from '../AuthStackResources/text-updated.png';
import styles from './ProfileContainer.module.css';

import Page2 from '../AuthStackResources/page_2.png';
import Page4 from '../AuthStackResources/page_4.png';
import Knight2 from '../AuthStackResources/knight_2.png';
import Knight4 from '../AuthStackResources/knight_4.png';
import Baronet2 from '../AuthStackResources/baronet_2.png';
import Baronet4 from '../AuthStackResources/baronet_4.png';

const ProfileContainer = ({
  name,
  level,
  isSelected,
  onClick,
  isNewProfile,
  handleProfileSelect,
  newData,
  updateProfiles,
  setShowEnterNameImage,
  showEnterNameImage,
}) => {
  const [text, setText] = useState(name);

  const handleAddProfile = (profileName) => {
    const trimmed = profileName.trim();
    if (!trimmed) {
      return;
    }

    const nextId =
      newData.length > 0 ? Math.max(...newData.map((profile) => profile.id)) + 1 : 1;

    const newProfile = {
      id: nextId,
      name: trimmed,
      level: 'page',
      options: { ...defaultProfileOptions },
    };

    updateProfiles([...newData, newProfile]);
    handleProfileSelect(newProfile);
  };

  const getProfileImage = (profileLevel, selected) => {
    switch (profileLevel) {
      case 'page':
        return selected ? Page4 : Page2;
      case 'knight':
        return selected ? Knight4 : Knight2;
      case 'baronet':
        return selected ? Baronet4 : Baronet2;
      default:
        return selected ? Page4 : Page2;
    }
  };

  const profileImage = getProfileImage(level, isSelected);

  return (
    <>
      {isNewProfile && showEnterNameImage ? (
        <img className={styles.enterNameImage} src={EnterNameHereImage} alt="Enter Name" />
      ) : null}
      <div className={styles.profileRow} onClick={onClick} data-testid="profile-row">
        <img className={styles.profileSprite} src={profileImage} alt="" />
        <div className={styles.nameOverlay}>
          {isNewProfile ? (
            <ProfileInput
              text={text}
              setText={setText}
              setShowEnterNameImage={setShowEnterNameImage}
              handleAddProfile={handleAddProfile}
            />
          ) : (
            <div className={styles.profileDiv}>{text}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileContainer;