import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainMenu } from './index';
import { Authentication } from '../AuthenticationStack/index';

const MainMenuStack = ( { navigateToAuthentication, selectedProfile } ) => {
  return (
    <Routes>
      <Route path="/main-menu" element={<MainMenu selectedProfile={selectedProfile} navigateToAuthentication={navigateToAuthentication} />} />
      <Route path="/start" element={<Authentication />} />
      <Route path="/change-player" element={<Authentication />} />
      <Route path="/options" element={<Authentication />} />
      <Route path="/credits" element={<Authentication />} />
      <Route path="/quit" element={<Authentication />} />
      <Route path="*" element={<Navigate to="/main-menu" />} />
    </Routes>
  );
};

export default MainMenuStack;