import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Authentication } from './index';

const AuthenticationStack = ({ userData, navigateToMainMenu }) => {
  return (
    <Routes>
      <Route path="/authentication" element={<Authentication userData={userData} navigateToMainMenu={navigateToMainMenu} />} />
      <Route path="*" element={<Navigate to="/authentication" />} />
    </Routes>
  );
};

export default AuthenticationStack;