import React from 'react';
import styles from './ComponentTop.module.css';
import { Bucket } from './Bucket/index';
// import { TopIconComponent } from './index';
import TopIconComponent from './TopIconComponent/TopIconComponent';
import iconData from './ComponentTopResourceStack/index';

const ComponentTop = () => {
    return (
        <div className={styles.mainDiv}>
            <div className={styles.saveButton}>
                <TopIconComponent passiveIcon={iconData.savePassive} activeIcon={iconData.saveActive} type='save' />
            </div>
            <div className={styles.bucketButton}>
                <TopIconComponent passiveIcon={iconData.bucketPassive} activeIcon={iconData.bucketActive} type='bucket' />
                {/* <Bucket /> */}
            </div>
            <div className={styles.moveBrick}>
                <TopIconComponent passiveIcon={iconData.movePassive} activeIcon={iconData.moveActive} type='move' />
            </div>
            <div className={styles.rotateBrick}>
                <TopIconComponent passiveIcon={iconData.reversePassive} activeIcon={iconData.reverseActive} type='reverse' />
            </div>
            <div className={styles.repaintBrick}>
                <TopIconComponent passiveIcon={iconData.repaintPassive} activeIcon={iconData.repaintActive} type='repaint' />
            </div>
            <div className={styles.deleteBrick}></div>
            <div className={styles.interactBrick}></div>
            <div className={styles.driveBrick}></div>
            <div className={styles.driveAction}></div>
            ComponentTop
        </div>
    );
}

export default ComponentTop;