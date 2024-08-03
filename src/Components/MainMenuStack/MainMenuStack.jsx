import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainMenu, Options, Credits, StartStack } from './index';
import { Authentication } from '../AuthenticationStack/index';

const MainMenuStack = ({ navigateToAuthentication, selectedProfile }) => {
    const navigate = useNavigate();

    const navigateToMenu = () => {
        navigate('/main-menu');
    };

    const navigateToStart = () => {
        navigate('/start-stack/start');
    };

    return (
        <Routes>
            <Route path="/main-menu" element={<MainMenu selectedProfile={selectedProfile} navigateToAuthentication={navigateToAuthentication} navigateToStart={navigateToStart} />} />
            <Route path="/change-player" element={<Authentication />} />
            <Route path="/options" element={<Options navigateToMenu={navigateToMenu} selectedProfile={selectedProfile} />} />
            <Route path="/credits" element={<Credits navigateToMenu={navigateToMenu} />} />
            <Route path="/quit" element={<Authentication />} />
            <Route path="/start-stack/*" element={<StartStack navigateToMenu={navigateToMenu} />} />
            <Route path="*" element={<Navigate to="/main-menu" />} />
        </Routes>
    );
};

export default MainMenuStack;