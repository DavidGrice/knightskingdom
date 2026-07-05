import React, { useState, useEffect } from 'react';
import styles from './Authentication.module.css';
import { ProfileContainer } from '..';
import { BackCheckmarkButton, MenuScreenLayout } from '../../Common';
import CommonComponent from '../../Common/CommonComponent/CommonComponent';
import Trashcan2 from '../AuthStackResources/trashcan_2.png';
import Trashcan4 from '../AuthStackResources/trashcan_4.png';
import backgroundImage from '../AuthStackResources/background.png';

const Authentication = ({ userData, updateUserData, navigateToMainMenu }) => {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newData, setNewData] = useState(userData);
  const [showEnterNameImage, setShowEnterNameImage] = useState(false);

  useEffect(() => {
    if (userData) {
      setNewData(userData);
    } else {
      setNewData([]);
    }
  }, [userData]);

  const updateProfiles = (updatedData) => {
    setNewData(updatedData);
    updateUserData(updatedData);
  };

  const handleProfileSelect = (profile) => {
    setSelectedProfile(profile);
    setShowEnterNameImage(false);
  };

  const handleCheckmarkClick = () => {
    if (selectedProfile) {
      navigateToMainMenu(selectedProfile);
    }
  };

  const handleTrashcanClick = () => {
    if (selectedProfile) {
      const updatedData = newData.filter((profile) => profile.id !== selectedProfile.id);
      updateProfiles(updatedData);
      setSelectedProfile(null);
    }
  };

  return (
    <MenuScreenLayout
      screenKey="AUTHENTICATION"
      backgroundImage={backgroundImage}
      bottomLeft={(
        <BackCheckmarkButton onClick={handleCheckmarkClick} />
      )}
      bottomRight={(
        <CommonComponent
          initialImage={Trashcan2}
          hoverImage={Trashcan4}
          altText="Trashcan"
          onClick={handleTrashcanClick}
        />
      )}
    >
      <div className={styles.profileScene} data-testid="auth-profile-list">
      {newData.length < 5 && (
        <ProfileContainer
          key="empty-input"
          name=""
          level="page"
          onClick={() => setSelectedProfile(null)}
          isNewProfile
          isSelected={false}
          handleProfileSelect={handleProfileSelect}
          newData={newData}
          updateProfiles={updateProfiles}
          setShowEnterNameImage={setShowEnterNameImage}
          showEnterNameImage={showEnterNameImage}
        />
      )}
      {newData.map((profile) => (
        <ProfileContainer
          key={profile.id}
          name={profile.name}
          level={profile.level}
          onClick={() => handleProfileSelect(profile)}
          isNewProfile={false}
          isSelected={selectedProfile && selectedProfile.id === profile.id}
        />
      ))}
      </div>
    </MenuScreenLayout>
  );
};

export default Authentication;