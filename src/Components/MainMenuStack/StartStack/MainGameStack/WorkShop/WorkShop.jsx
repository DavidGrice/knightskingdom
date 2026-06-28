import React, { useState } from 'react';
import styles from './WorkShop.module.css';
import { GameShell, ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';

const WorkShop = ({ navigateToMainGame, mapData }) => {
  const [showBucket, setShowBucket] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null);

  const handleBucket = () => {
    setShowBucket(!showBucket);
  };

  const handleSave = () => {
    navigateToMainGame(mapData);
  };

  const handlePaint = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
  };

  const handlePalette = () => {
    setIsPaletteOpen(!isPaletteOpen);
  };

  return (
    <div className={styles.workshopRoot}>
      {mapData?.name && (
        <div className={styles.worldLabel}>{mapData.name}</div>
      )}
      <GameShell
        mode="workshop"
        top={(
          <ComponentTop
            mode="workshop"
            handleBucket={handleBucket}
            handlePaint={handlePaint}
            handlePalette={handlePalette}
            handleSave={handleSave}
            navigateToMainGame={() => navigateToMainGame(mapData)}
          />
        )}
        bottom={(
          <ComponentBottom
            mode="workshop"
            activeIcon={activeIcon}
            setActiveIcon={setActiveIcon}
          />
        )}
      >
        <div className={styles.stage}>
          {showBucket && <Bucket dataSource="bricks" />}
          {isPaletteOpen && <Palette variant="workshop" />}
        </div>
      </GameShell>
    </div>
  );
};

export default WorkShop;