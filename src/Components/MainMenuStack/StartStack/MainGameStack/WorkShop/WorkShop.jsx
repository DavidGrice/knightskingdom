import React, { useMemo, useRef, useState } from 'react';
import styles from './WorkShop.module.css';
import {
  workshopStageToCssVars,
  WORKSHOP_STAGE_METRICS,
  useWorkshopCanvasScale,
} from '../../../../Common';
import { ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';

const WorkShop = ({ navigateToMainGame, mapData }) => {
  const scalerRef = useRef(null);
  const [showBucket, setShowBucket] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null);

  useWorkshopCanvasScale(scalerRef);

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
    <div className={styles.workshopRoot}>
      <div ref={scalerRef} className={styles.workshopScaler} style={stageStyle}>
        <div className={styles.canvas}>
          <div className={styles.bottomComponent}>
            <ComponentBottom
              mode="workshop"
              activeIcon={activeIcon}
              setActiveIcon={setActiveIcon}
            />
          </div>
          <div className={styles.stage}>
            {showWorldTitle && (
              <div
                className={styles.worldLabel}
                style={{ left: `${worldTitle.x}px`, top: `${worldTitle.y}px` }}
              >
                {mapData.name}
              </div>
            )}
            {isPaletteOpen && <Palette variant="workshop" />}
          </div>
          {showBucket && (
            <div className={styles.bucketLayer}>
              <Bucket dataSource="bricks" />
            </div>
          )}
          <div className={styles.topComponent}>
            <ComponentTop
              mode="workshop"
              handleBucket={handleBucket}
              handlePaint={handlePaint}
              handlePalette={handlePalette}
              handleSave={handleSave}
              navigateToMainGame={() => navigateToMainGame(mapData)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkShop;