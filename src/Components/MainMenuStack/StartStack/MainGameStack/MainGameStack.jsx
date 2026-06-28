import React, { useCallback, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MainGame, WorkShop, SnapShot } from './index';
import { GameProvider } from './context';
import { saveWorldProgress, appendWorldSnapshot } from '../../../../api/worldSave';

const MainGameStack = ({
  navigateToStartMenu,
  navigateToMainGame,
  mapData,
  selectedProfile,
  userData,
  updateUserData,
}) => {
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
        snapshots: [
          ...(prevData.snapshots || []),
          ...(snapshotData.imageDataUrl ? [snapshotData] : []),
        ],
      }));
    }
    navigate('/start-stack/main-game/snapshot');
  };

  const onSaveWorldProgress = useCallback((profileId, worldId, payload) => {
    if (!userData || !updateUserData) {
      return;
    }
    const updated = saveWorldProgress(userData, profileId, worldId, payload);
    updateUserData(updated);
  }, [userData, updateUserData]);

  const onAppendSnapshot = useCallback((profileId, worldId, snapshotEntry) => {
    if (!userData || !updateUserData) {
      return;
    }
    const updated = appendWorldSnapshot(userData, profileId, worldId, snapshotEntry);
    updateUserData(updated);
  }, [userData, updateUserData]);

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
          <GameProvider
            mapData={worldData}
            selectedProfile={selectedProfile}
            onSaveWorldProgress={onSaveWorldProgress}
            onAppendSnapshot={onAppendSnapshot}
            navigateToWorkshop={navigateToWorkshop}
            navigateToSnapshot={navigateToSnapshot}
          >
            <MainGame
              navigateToStartMenu={navigateToStartMenu}
              navigateToWorkshop={navigateToWorkshop}
              navigateToSnapshot={navigateToSnapshot}
              mapData={worldData}
            />
          </GameProvider>
        }
      />
      <Route path="*" element={<Navigate to="/game" />} />
    </Routes>
  );
};

export default MainGameStack;