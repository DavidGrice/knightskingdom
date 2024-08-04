import React from 'react';
import styles from './ComponentTop.module.css';
import { Bucket } from './Bucket/index';
// import { Drive, Palette } from './index';
import TopIconComponent from './TopIconComponent/TopIconComponent';
import { iconData } from './ComponentTopResourceStack/index';

const ComponentTop = () => {
    return (
        <div className={styles.mainDiv}>
            <div className={styles.saveButton}>
                <TopIconComponent passiveIcon={iconData.savePassive} activeIcon={iconData.saveActive} type='save' />
            </div>
            <div className={styles.bucketButton}>
                <Bucket />
            </div>
            <div className={styles.moveBrick}></div>
            <div className={styles.rotateBrick}></div>
            <div className={styles.repaintBrick}></div>
            <div className={styles.deleteBrick}></div>
            <div className={styles.interactBrick}></div>
            <div className={styles.driveBrick}></div>
            <div className={styles.driveAction}></div>
            ComponentTop
        </div>
    );
}

export default ComponentTop;