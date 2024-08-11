import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Start, MainGameStack } from './index';

const StartStack = ({ navigateToMenu }) => {
    const [selectedMap, setSelectedMap] = useState(null);
    const navigate = useNavigate();

    const navigateToStartMenu = () => {
        navigate('/start-stack/start');
    }

    const navigateToMainGame = (mapData) => {
        setSelectedMap(mapData);
        navigate('/start-stack/main-game/game');
    }

    return (
        <Routes>
            <Route path="/start" element={<Start navigateToMenu={navigateToMenu} navigateToMainGame={navigateToMainGame} />} />
            <Route path="/main-game/*" element={<MainGameStack navigateToStartMenu={navigateToStartMenu} navigateToMainGame={navigateToMainGame} mapData={selectedMap}  />} />
            <Route path="*" element={<Navigate to="/start" />} />
        </Routes>
    );
};

export default StartStack;