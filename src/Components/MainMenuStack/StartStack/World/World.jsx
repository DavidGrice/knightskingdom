import React, { useEffect, useState } from 'react';
import styles from './World.module.css';
import { WorldHeader, WorldBody } from '..';
import { useManagedLoading } from '@/lib/context/GameLoadingProvider';

const World = ({ setWorldData }) => {
  const [isLocalWorlds, setIsLocalWorlds] = useState(true);
  const [isSharedWorlds, setIsSharedWorlds] = useState(false);
  const [didUpdate, setDidUpdate] = useState(false);
  const [isSwitchingPanel, setIsSwitchingPanel] = useState(false);

  useManagedLoading('world-panel', isSwitchingPanel);

  useEffect(() => {
    if (!isSwitchingPanel) {
      return undefined;
    }
    const timer = window.setTimeout(() => setIsSwitchingPanel(false), 450);
    return () => window.clearTimeout(timer);
  }, [didUpdate, isSwitchingPanel]);

  const changeWorld = () => {
    setIsSwitchingPanel(true);
    if (isLocalWorlds) {
      setIsLocalWorlds(false);
      setIsSharedWorlds(true);
    } else {
      setIsSharedWorlds(false);
      setIsLocalWorlds(true);
    }
    setDidUpdate((prev) => !prev);
  };

  return (
    <div className={styles.componentHolder}>
      <WorldHeader changeWorld={changeWorld} />
      <WorldBody
        isLocalWorlds={isLocalWorlds}
        didUpdate={didUpdate}
        setDidUpdate={setDidUpdate}
        setWorldData={setWorldData}
      />
    </div>
  );
};

export default World;