import React from 'react';
import styles from './ComponentTop.module.css';
import { Bucket } from './Bucket/index';
import TopIconComponent from './TopIconComponent/TopIconComponent';
import { IconComponent } from "../../../../../Common";
import { leaveIcon } from './ComponentTopResourceStack/index';

const ComponentTop = ({ navigateToStartMenu, handleBucket }) => {
    
    return (
        <div className={styles.mainDiv}>
            <div className={styles.saveButton}>
                <TopIconComponent passiveIcon={leaveIcon.iconData.savePassive} activeIcon={leaveIcon.iconData.saveActive} type='save' />
            </div>
            <div
                className={styles.bucketButton}
                onClick={handleBucket}>
                <TopIconComponent passiveIcon={leaveIcon.iconData.bucketPassive} activeIcon={leaveIcon.iconData.bucketActive} type='bucket' />
            </div>
            <div className={styles.middleDiv}>
                <div className={styles.moveBrick}>
                    <TopIconComponent passiveIcon={leaveIcon.iconData.movePassive} activeIcon={leaveIcon.iconData.moveActive} type='move' />
                </div>
                <div className={styles.rotateBrick}>
                    <TopIconComponent passiveIcon={leaveIcon.iconData.reversePassive} activeIcon={leaveIcon.iconData.reverseActive} type='reverse' />
                </div>
                <div className={styles.repaintBrick}>
                    <TopIconComponent passiveIcon={leaveIcon.iconData.repaintPassive} activeIcon={leaveIcon.iconData.repaintActive} type='repaint' />
                </div>
                <div className={styles.deleteBrick}>
                    <TopIconComponent passiveIcon={leaveIcon.iconData.deletePassive} activeIcon={leaveIcon.iconData.deleteActive} type='delete' />
                </div>
                <div className={styles.interactBrick}>
                    <TopIconComponent passiveIcon={leaveIcon.iconData.actionPassive} activeIcon={leaveIcon.iconData.actionActive} type='action' />
                </div>
                <div className={styles.driveBrick}>
                    <TopIconComponent passiveIcon={leaveIcon.iconData.drivePassive} activeIcon={leaveIcon.iconData.driveActive} type='drive' />
                </div>
            </div>
            <div className={styles.driveAction}>
                <TopIconComponent passiveIcon={leaveIcon.iconData.playPassive} activeIcon={leaveIcon.iconData.playActive} type='play' />
            </div>
            <div className={styles.goodBye} onClick={navigateToStartMenu}>
                <IconComponent type={'leave'} placeholderImage={leaveIcon.placeHolder} frames={leaveIcon.leaveFrames} />
            </div>
        </div>
    );
}

export default ComponentTop;