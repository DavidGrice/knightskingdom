import React, { useMemo, useState } from 'react';
import styles from './WorkShop.module.css';
import { workshopStageToCssVars, WORKSHOP_STAGE_METRICS } from '../../../../Common';
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

  const stageStyle = useMemo(() => workshopStageToCssVars(), []);
  const { worldTitle } = WORKSHOP_STAGE_METRICS;
  const showWorldTitle = worldTitle.visible && mapData?.name;

  return (
    <div className={styles.workshopRoot} style={stageStyle}>
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
          {showWorldTitle && (
            <div
              className={styles.worldLabel}
              style={{ left: `${worldTitle.x}px`, top: `${worldTitle.y}px` }}
            >
              {mapData.name}
            </div>
          )}
          {showBucket && <Bucket dataSource="bricks" />}
          {isPaletteOpen && <Palette variant="workshop" />}
        </div>
      </GameShell>
    </div>
  );
};

export default WorkShop;