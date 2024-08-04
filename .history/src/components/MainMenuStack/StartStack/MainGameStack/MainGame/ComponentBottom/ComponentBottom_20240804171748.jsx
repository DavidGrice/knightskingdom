import React, { useState } from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent } from './index';
import { images, frames } from './ComponentBottomResourceStack/index';

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
        </div>
    );
}

export default ComponentBottom;