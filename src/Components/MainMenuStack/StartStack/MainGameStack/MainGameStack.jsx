import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainGame, WorkShop, SnapShot } from './index';

const MainGameStack = ({ navigateToStartMenu, navigateToMainGame, mapData }) => {
  const [worldData, setWorldData] = useState(mapData);
  const navigate = useNavigate();

  const navigateToWorkshop = (updatedWorldData) => {
    if (updatedWorldData) {
      setWorldData(updatedWorldData);
    }
    navigate('/start-stack/main-game/workshop');
  };

  const navigateToSnapshot = (snapshotData) => {
    if (snapshotData) {
      setWorldData((prevData) => ({
        ...prevData,
        sceneSnapshot: snapshotData,
      }));
    }
    navigate('/start-stack/main-game/snapshot');
  };

  return (
    <Routes>
      <Route
        path="/snapshot"
        element={<SnapShot navigateToMainGame={navigateToMainGame} mapData={worldData} />}
      />
      <Route
        path="/workshop"
        element={<WorkShop navigateToMainGame={navigateToMainGame} mapData={worldData} />}
      />
      <Route
        path="/game"
        element={
          <MainGame
            navigateToStartMenu={navigateToStartMenu}
            navigateToWorkshop={navigateToWorkshop}
            navigateToSnapshot={navigateToSnapshot}
            mapData={worldData}
          />
        }
      />
      <Route path="*" element={<Navigate to="/game" />} />
    </Routes>
  );
};

export default MainGameStack;