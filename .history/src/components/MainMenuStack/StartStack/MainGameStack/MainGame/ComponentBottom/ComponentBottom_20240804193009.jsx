import React, { useState } from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent } from './index';
import { images, frames } from './ComponentBottomResourceStack/index';
import { HelpComponent } from "../../../../../Common/index";

const ComponentBottom = () => {
    const [activeIcon, setActiveIcon] = useState(null);
    // const handleIconClick = (type) => {
    //     if (type === 'climate') {
    //         handleDrive();
    //     } else if (type === 'music') {
    //         handlePalette();
    //     }
    //     setActiveIcon(prevActiveIcon => prevActiveIcon === type ? null : type);
    // };


    return (
        <div className={styles.componentBottom}>
            <div className={styles.hammerButton}>
                <BottomIconComponent passiveIcon={images.hammer[0]} activeIcon={images.hammer[1]} />
            </div>
            <div className={styles.snapShotButton}>
                <BottomIconComponent passiveIcon={images.camera[0]} activeIcon={images.camera[1]} />
            </div>
            <div className={styles.climateButton}>
                <BottomIconComponent passiveIcon={images.climate[0]} activeIcon={images.climate[1]} />
            </div>

            <div className={styles.middleDiv}>
            </div>
            <div className={styles.musicButton}>
                <BottomIconComponent passiveIcon={images.music[0]} activeIcon={images.music[1]} />
            </div>
            <div className={styles.bottomRightCorner}>
                <HelpComponent placeholderImage={frames[0]} frames={frames} />
            </div>
        </div>
    );
}

export default ComponentBottom;