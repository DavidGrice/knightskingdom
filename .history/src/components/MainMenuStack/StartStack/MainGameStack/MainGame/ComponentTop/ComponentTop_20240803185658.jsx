import React from 'react';
import styles from './ComponentTop.module.css';
import { Bucket } from './Bucket/index';
import { IconComponent, Drive, Palette } from './index';

const ComponentTop = () => {
    return (
        <div className={styles.mainDiv}>
            <div className={styles.saveButton}>
                <IconComponent passiveIcon='./ComponentResourceStack/save_2.png' activeIcon='./ComponentResourceStack/save_5.png' type='save' />
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