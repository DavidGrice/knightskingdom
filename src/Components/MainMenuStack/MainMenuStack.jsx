import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainMenu, Options, Credits } from './index';
import { Authentication } from '../AuthenticationStack/index';

const MainMenuStack = ( { navigateToAuthentication, selectedProfile } ) => {
  const navigate = useNavigate();

  const navigateToMenu = () => {
    navigate('/main-menu');
  };

  return (
    <Routes>
      <Route path="/main-menu" element={<MainMenu selectedProfile={selectedProfile} navigateToAuthentication={navigateToAuthentication} />} />
      <Route path="/start" element={<Authentication />} />
      <Route path="/change-player" element={<Authentication />} />
      <Route path="/options" element={<Options navigateToMenu={navigateToMenu} />} />
      <Route path="/credits" element={<Credits navigateToMenu={navigateToMenu} />} />
      <Route path="/quit" element={<Authentication />} />
      <Route path="*" element={<Navigate to="/main-menu" />} />
    </Routes>
  );
};

export default MainMenuStack;