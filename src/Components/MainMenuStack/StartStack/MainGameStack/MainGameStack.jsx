import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainGame, WorkShop, SnapShot } from './index';

const MainGameStack = ({ navigateToStartMenu, navigateToMainGame, mapData }) => {
    const [worldData, setWorldData] = useState(mapData);
    const navigate = useNavigate();

    const navigateToWorkshop = (worldData) => {
        setWorldData(worldData);
        navigate('/start-stack/main-game/workshop');
    }

    const navigateToSnapshot = () => {
        // Ensure setWorldData is called with the correct data
        setWorldData((prevData) => {
            const updatedData = { ...prevData, /* new data */ };
            console.log("Updated worldData", updatedData);
            return updatedData;
        });
        navigate('/start-stack/main-game/snapshot');
    }

    return (
        <Routes>
            <Route path="/snapshot" element={<SnapShot navigateToMainGame={navigateToMainGame} mapData={worldData} />} />
            <Route path="/workshop" element={<WorkShop navigateToMainGame={navigateToMainGame} mapData={worldData} />} />
            <Route path="/game" element={
                <MainGame 
                    navigateToStartMenu={navigateToStartMenu} 
                    navigateToWorkshop={navigateToWorkshop} 
                    navigateToSnapshot={navigateToSnapshot} 
                    mapData={worldData}
                    setWorldData={setWorldData}
                     />}
                />
            <Route path="*" element={<Navigate to="/game" />} />
        </Routes>
    );
};

export default MainGameStack;