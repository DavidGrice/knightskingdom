import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainMenu, Options, Credits, StartStack } from './index';
import { updateProfileOptions } from '../../api/worldSave';

const MainMenuStack = ({ navigateToAuthentication, selectedProfile, userData, updateUserData }) => {
  const navigate = useNavigate();

  const navigateToMenu = () => {
    navigate('/main-menu');
  };

  const navigateToStart = () => {
    navigate('/start-stack/start');
  };

  const handleUpdateOptions = (optionsPatch) => {
    if (!selectedProfile?.id || !userData || !updateUserData) {
      return;
    }
    const updated = updateProfileOptions(userData, selectedProfile.id, optionsPatch);
    updateUserData(updated);
  };

  const currentProfile = userData?.find((p) => p.id === selectedProfile?.id) || selectedProfile;

  return (
    <Routes>
      <Route
        path="/main-menu"
        element={
          <MainMenu
            selectedProfile={currentProfile}
            navigateToAuthentication={navigateToAuthentication}
            navigateToStart={navigateToStart}
          />
        }
      />
      <Route
        path="/options"
        element={
          <Options
            navigateToMenu={navigateToMenu}
            selectedProfile={currentProfile}
            onUpdateOptions={handleUpdateOptions}
          />
        }
      />
      <Route path="/credits" element={<Credits navigateToMenu={navigateToMenu} />} />
      <Route
        path="/start-stack/*"
        element={
          <StartStack
            navigateToMenu={navigateToMenu}
            selectedProfile={currentProfile}
            userData={userData}
            updateUserData={updateUserData}
          />
        }
      />
      <Route path="*" element={<Navigate to="/main-menu" />} />
    </Routes>
  );
};

export default MainMenuStack;