import React, { useEffect, useState } from 'react';
import styles from './World.module.css';
import { WorldHeader, WorldBody } from '..';
import { useManagedLoading } from '@/lib/context/GameLoadingProvider';

const World = ({ setWorldData }) => {
  const [isLocalWorlds, setIsLocalWorlds] = useState(true);
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

  const switchPanel = (local) => {
    if (local === isLocalWorlds) {
      return;
    }
    setIsSwitchingPanel(true);
    setIsLocalWorlds(local);
    setDidUpdate((prev) => !prev);
    setWorldData(null);
  };

  return (
    <div className={styles.componentHolder} data-testid="world-panel-shell">
      <WorldHeader
        isLocalWorlds={isLocalWorlds}
        onSelectLocal={() => switchPanel(true)}
        onSelectShared={() => switchPanel(false)}
      />
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