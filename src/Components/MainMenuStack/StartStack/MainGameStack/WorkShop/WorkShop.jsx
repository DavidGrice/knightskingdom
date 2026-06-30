'use client';

import React, { useMemo, useRef, useState } from 'react';
import styles from './WorkShop.module.css';
import {
  workshopStageToCssVars,
  WORKSHOP_STAGE_METRICS,
  useWorkshopCanvasScale,
} from '../../../../Common';
import { GameShell, ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';
import { WorkshopProvider, useWorkshopContext } from './context';
import { WorkshopEngine } from './WorkshopEngine';

const WorkShopContent = ({ navigateToMainGame, mapData }) => {
  const scalerRef = useRef(null);
  const [activeIcon, setActiveIcon] = useState(null);
  const {
    state,
    engineRef,
    resetModes,
    handleBucket,
    handleBrickSelect,
    handleMove,
    handleRotate,
    handleDelete,
    handleDuplicate,
    handlePalette,
    handleColor,
    handleSweep,
  } = useWorkshopContext();

  const {
    mode,
    selectedBrickId,
    color,
    showBucket,
    isPaletteOpen,
  } = state;

  useWorkshopCanvasScale(scalerRef);

  const handleSave = () => {
    navigateToMainGame(mapData);
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
            handleMove={handleMove}
            handleRotate={handleRotate}
            handleDelete={handleDelete}
            handleDuplicate={handleDuplicate}
            handlePalette={handlePalette}
            handleSave={handleSave}
            resetModes={resetModes}
            navigateToMainGame={() => navigateToMainGame(mapData)}
            activeToolbarIcon={activeIcon}
            setActiveToolbarIcon={setActiveIcon}
          />
        )}
        bottom={(
          <ComponentBottom
            mode="workshop"
            activeIcon={activeIcon}
            setActiveIcon={setActiveIcon}
            onSweep={handleSweep}
          />
        )}
      >
        <div ref={scalerRef} className={styles.workshopScaler}>
          <div className={styles.canvas}>
            <div className={styles.stage}>
              <WorkshopEngine
                ref={engineRef}
                mode={mode}
                selectedBrickId={selectedBrickId}
                color={color}
              />
              {showWorldTitle && (
                <div
                  className={styles.worldLabel}
                  style={{ left: `${worldTitle.x}px`, top: `${worldTitle.y}px` }}
                >
                  {mapData.name}
                </div>
              )}
              {isPaletteOpen && (
                <Palette variant="workshop" onColorSelect={handleColor} />
              )}
            </div>
          </div>
        </div>
      </GameShell>
      {showBucket && (
        <div className={styles.bucketLayer}>
          <Bucket dataSource="bricks" onBrickSelect={handleBrickSelect} />
        </div>
      )}
    </div>
  );
};

const WorkShop = (props) => (
  <WorkshopProvider>
    <WorkShopContent {...props} />
  </WorkshopProvider>
);

export default WorkShop;