import React, { useState } from 'react';
import { ProfileInput } from '..';
import { defaultProfileOptions } from '../../../api';
import EnterNameHereImage from '../AuthStackResources/text-updated.png';
import { getAuthRankSprite } from '../AuthStackResources/authRankAssets';
import { AUTH_HD_BASE, hiDpiImgProps } from '../../Common/hiDpiAsset';
import styles from './ProfileContainer.module.css';

const enterNameHd = hiDpiImgProps(EnterNameHereImage, `${AUTH_HD_BASE}/text-updated.png`);

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

  const rankSprite = getAuthRankSprite(level, isSelected);

  return (
    <>
      {isNewProfile && showEnterNameImage ? (
        <img className={styles.enterNameImage} alt="Enter Name" {...enterNameHd} />
      ) : null}
      <div className={styles.profileRow} onClick={onClick} data-testid="profile-row">
        <img className={styles.profileSprite} alt="" {...rankSprite} />
        <div className={styles.nameOverlay}>
          {isNewProfile ? (
            <ProfileInput
              text={text}
              setText={setText}
              setShowEnterNameImage={setShowEnterNameImage}
              handleAddProfile={handleAddProfile}
            />
          ) : (
            <div className={`${styles.nameText} ${styles.profileDiv}`}>{text}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileContainer;