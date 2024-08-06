import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainGame, WorkShop, SnapShot } from './index';

const MainGameStack = ({ navigateToStartMenu, navigateToMainGame, map }) => {
    const navigate = useNavigate();

    const navigateToWorkshop = () => {
        navigate('/start-stack/main-game/workshop');
    }

    const navigateToSnapshot = () => {
        navigate('/start-stack/main-game/snapshot');
    }

    return (
        <Routes>
            <Route path="/snapshot" element={<SnapShot navigateToMainGame={navigateToMainGame} />} />
            <Route path="/workshop" element={<WorkShop navigateToStartMenu={navigateToStartMenu} />} />
            <Route path="/game" element={
                <MainGame 
                    navigateToStartMenu={navigateToStartMenu} 
                    navigateToWorkshop={navigateToWorkshop} 
                    navigateToSnapshot={navigateToSnapshot} 
                    map={map} />}
                />
            <Route path="*" element={<Navigate to="/game" />} />
        </Routes>
    );
};

export default MainGameStack;