import React, { useState } from 'react';
import { GameShell, ComponentTop, ComponentBottom, Bucket, Palette } from '../shared';

const WorkShop = ({ navigateToMainGame }) => {
  const [showBucket, setShowBucket] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [activeIcon, setActiveIcon] = useState(null);

  const handleBucket = () => {
    setShowBucket(!showBucket);
  }

  const handleSave = () => {
    setIsSaveOpen(!isSaveOpen);
  }

  const handlePaint = () => {
    if (isPaletteOpen) {
      setIsPaletteOpen(false);
    }
  }

  const handlePalette = () => {
    setIsPaletteOpen(!isPaletteOpen);
  }

  return (
    <GameShell
      mode="workshop"
      top={
        <ComponentTop
          mode="workshop"
          handleBucket={handleBucket}
          handlePaint={handlePaint}
          handlePalette={handlePalette}
          handleSave={handleSave}
          navigateToMainGame={navigateToMainGame}
        />
      }
      bottom={
        <ComponentBottom
          mode="workshop"
          activeIcon={activeIcon}
          setActiveIcon={setActiveIcon}
        />
      }
    >
      {showBucket && (
        <div>
          <Bucket dataSource="bricks" />
        </div>
      )}
      {isPaletteOpen && (
        <div>
          <Palette variant="workshop" />
        </div>
      )}
    </GameShell>
  );
}

export default WorkShop;