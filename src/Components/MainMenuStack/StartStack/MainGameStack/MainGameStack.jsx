import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainGame } from './index';

const MainGameStack = ({ navigateToStartMenu, map }) => {
    return (
        <Routes>
            <Route path="/game" element={<MainGame navigateToStartMenu={navigateToStartMenu} map={map} />} />
            <Route path="*" element={<Navigate to="/game" />} />
        </Routes>
    );
};

export default MainGameStack;