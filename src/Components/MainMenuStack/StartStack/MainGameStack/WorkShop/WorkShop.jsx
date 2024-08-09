import React, { useState } from 'react';
import styles from './WorkShop.module.css';
import { ComponentTop, ComponentBottom } from './index';
import { Bucket } from './ComponentTop/Bucket/index';
import { Palette } from './ComponentTop/Palette/index';

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
        <div className={styles.mainDiv}>
            <div className={styles.topComponent}>
                <ComponentTop
                    handleBucket={handleBucket}
                    handlePaint={handlePaint}
                    handlePalette={handlePalette}
                    handleSave={handleSave}
                    navigateToMainGame={navigateToMainGame} />
            </div>
            {
            showBucket && (<div>
                <Bucket />
            </div>)
            }
            {
            isPaletteOpen && (<div>
                <Palette />
            </div>)
            }
            <div className={styles.bottomComponent}>
              <ComponentBottom
                activeIcon={activeIcon}
                setActiveIcon={setActiveIcon}
              />
          </div>
        </div>
    );
}

export default WorkShop;