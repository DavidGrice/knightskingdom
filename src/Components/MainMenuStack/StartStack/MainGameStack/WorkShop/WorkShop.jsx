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

const WorkShopContent = () => {
  const scalerRef = useRef(null);
  const [activeIcon, setActiveIcon] = useState(null);
  const {
    state,
    settings,
    engineRef,
    workshopDraft,
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
    handleSave,
    handleLeave,
    mapData,
  } = useWorkshopContext();

  const {
    mode,
    selectedBrickId,
    color,
    showBucket,
    isPaletteOpen,
  } = state;

  useWorkshopCanvasScale(scalerRef);

  const stageStyle = useMemo(() => workshopStageToCssVars(), []);
  const { worldTitle } = WORKSHOP_STAGE_METRICS;
  const showWorldTitle = worldTitle.visible && mapData?.name;

  return (
    <div className={styles.workshopRoot} style={stageStyle} data-testid="workshop-root">
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
            navigateToMainGame={handleLeave}
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
        <div ref={scalerRef} className={styles.workshopScaler} data-testid="workshop-scaler">
          <div className={styles.canvas} data-testid="workshop-canvas">
            <div className={styles.stage} data-testid="workshop-stage">
              <WorkshopEngine
                key={settings.rendererKey}
                ref={engineRef}
                settings={settings}
                mode={mode}
                selectedBrickId={selectedBrickId}
                showBucket={showBucket}
                color={color}
                workshopDraft={workshopDraft}
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
        <div className={styles.bucketLayer} data-testid="workshop-bucket-layer">
          <Bucket dataSource="bricks" onBrickSelect={handleBrickSelect} />
        </div>
      )}
    </div>
  );
};

const WorkShop = ({
  mapData,
  navigateToMainGame,
  currentProfile,
  workshopDraft,
  onSaveWorkshopDraft,
  onSaveWorkshopExport,
}) => (
  <WorkshopProvider
    mapData={mapData}
    currentProfile={currentProfile}
    workshopDraft={workshopDraft}
    onSaveWorkshopDraft={onSaveWorkshopDraft}
    onSaveWorkshopExport={onSaveWorkshopExport}
    navigateToMainGame={navigateToMainGame}
  >
    <WorkShopContent />
  </WorkshopProvider>
);

export default WorkShop;