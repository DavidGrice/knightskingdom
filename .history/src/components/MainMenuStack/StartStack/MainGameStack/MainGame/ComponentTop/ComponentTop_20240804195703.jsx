import React, { useState } from 'react';
import styles from './ComponentTop.module.css';
import TopIconComponent from './TopIconComponent/TopIconComponent';
import { IconComponent } from "../../../../../Common";
import { leaveIcon } from './ComponentTopResourceStack/index';

const ComponentTop = ({ navigateToStartMenu,
                        handleBucket,
                        handlePalette,
                        handleDrive,
                        handleAction,
                        handleSave,
                        handlePaintAndDrive}) => {
    const [activeIcon, setActiveIcon] = useState(null);

    const topIconComponents = [
        { passiveIcon: leaveIcon.iconData.movePassive, activeIcon: leaveIcon.iconData.moveActive, type: 'move', className: styles.moveBrick },
        { passiveIcon: leaveIcon.iconData.reversePassive, activeIcon: leaveIcon.iconData.reverseActive, type: 'reverse', className: styles.rotateBrick },
        { passiveIcon: leaveIcon.iconData.repaintPassive, activeIcon: leaveIcon.iconData.repaintActive, type: 'repaint', className: styles.repaintBrick },
        { passiveIcon: leaveIcon.iconData.deletePassive, activeIcon: leaveIcon.iconData.deleteActive, type: 'delete', className: styles.deleteBrick },
        { passiveIcon: leaveIcon.iconData.actionPassive, activeIcon: leaveIcon.iconData.actionActive, type: 'action', className: styles.interactBrick },
        { passiveIcon: leaveIcon.iconData.drivePassive, activeIcon: leaveIcon.iconData.driveActive, type: 'drive', className: styles.driveBrick },
    ];

    const handleIconClick = (type) => {
        if (type === 'drive') {
            handleDrive();
        } else if (type === 'repaint') {
            handlePalette();
        }
        setActiveIcon(prevActiveIcon => prevActiveIcon === type ? null : type);
    };

    
    return (
        <div className={styles.mainDiv}>
            <div className={styles.saveButton}
            onClick={handleSave}>
                <TopIconComponent passiveIcon={leaveIcon.iconData.savePassive} activeIcon={leaveIcon.iconData.saveActive} type='save' />
            </div>
            <div
                className={styles.bucketButton}
                onClick={handleBucket}>
                <TopIconComponent passiveIcon={leaveIcon.iconData.bucketPassive} activeIcon={leaveIcon.iconData.bucketActive} type='bucket' />
            </div>
            <div className={styles.middleDiv}>
                {topIconComponents.map((icon, index) => (
                    <div key={index} className={icon.className} onClick={() => handleIconClick(icon.type)}>
                        <TopIconComponent
                            passiveIcon={icon.passiveIcon}
                            activeIcon={icon.activeIcon}
                            type={icon.type}
                            isActive={activeIcon === icon.type}
                            handlePaintAndDrive={handlePaintAndDrive}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.driveAction}
                 onClick={handleAction}>
                <TopIconComponent passiveIcon={leaveIcon.iconData.playPassive} activeIcon={leaveIcon.iconData.playActive} type='play' />
            </div>
            <div className={styles.goodBye} onClick={navigateToStartMenu}>
                <IconComponent type={'leave'} placeholderImage={leaveIcon.placeHolder} frames={leaveIcon.leaveFrames} />
            </div>
        </div>
    );
}

export default ComponentTop;