import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainGame, WorkShop, SnapShot } from './index';

const MainGameStack = ({ navigateToStartMenu, map }) => {
    const navigate = useNavigate();

    const navigateToWorkshop = () => {
        navigate('/workshop');
    }

    return (
        <Routes>
            <Route path="/snapshot" element={<SnapShot navigateToStartMenu={navigateToStartMenu} />} />
            <Route path="/workshop" element={<WorkShop navigateToStartMenu={navigateToStartMenu} />} />
            <Route path="/game" element={<MainGame navigateToStartMenu={navigateToStartMenu} map={map} />} />
            <Route path="*" element={<Navigate to="/game" />} />
        </Routes>
    );
};

export default MainGameStack;