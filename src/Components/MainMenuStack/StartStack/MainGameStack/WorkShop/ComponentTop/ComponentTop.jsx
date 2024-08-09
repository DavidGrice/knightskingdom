import React, { useState } from 'react';
import styles from './ComponentTop.module.css';
import { leaveIcon } from './ComponentTopResourceStack/index';
import ComponentTopIcon from './ComponentTopIcon/ComponentTopIcon';
import { IconComponent } from "../../../../../Common";

const ComponentTop = ({ handleBucket, handlePaint, handlePalette, handleSave, navigateToMainGame }) => {
    const [activeIcon, setActiveIcon] = useState(null);

    const topIconComponents = [
        { passiveIcon: leaveIcon.iconData.brickMovePassive, activeIcon: leaveIcon.iconData.brickMoveActive, type: 'move', className: styles.moveBrick },
        { passiveIcon: leaveIcon.iconData.brickRotatePassive, activeIcon: leaveIcon.iconData.brickRotateActive, type: 'reverse', className: styles.rotateBrick },
        { passiveIcon: leaveIcon.iconData.brickRepaintPassive, activeIcon: leaveIcon.iconData.brickRepaintActive, type: 'repaint', className: styles.repaintBrick },
        { passiveIcon: leaveIcon.iconData.brickDeletePassive, activeIcon: leaveIcon.iconData.brickDeleteActive, type: 'delete', className: styles.deleteBrick },
        { passiveIcon: leaveIcon.iconData.brickDuplicatePassive, activeIcon: leaveIcon.iconData.brickDuplicateActive, type: 'duplicate', className: styles.interactBrick },
    ];

    const handleIconClick = (type) => {
        if (type === 'repaint') {
            handlePalette();
        }
        setActiveIcon(prevActiveIcon => prevActiveIcon === type ? null : type);
    };

    return (
        <div className={styles.mainDiv}>
            <div
                className={styles.bucketButton}
                onClick={handleBucket}>
                <ComponentTopIcon passiveIcon={leaveIcon.iconData.bucketPassive} activeIcon={leaveIcon.iconData.bucketActive} type='bucket' />
            </div>

            <div className={styles.saveButton}
            onClick={handleSave}>
                <ComponentTopIcon passiveIcon={leaveIcon.iconData.savePassive} activeIcon={leaveIcon.iconData.saveActive} type='save' />
            </div>

            <div className={styles.middleDiv}>
                {topIconComponents.map((icon, index) => (
                    <div
                        key={index}
                        className={icon.className}
                        onClick={() => handleIconClick(icon.type)}>
                        <ComponentTopIcon
                            passiveIcon={icon.passiveIcon}
                            activeIcon={icon.activeIcon}
                            type={icon.type}
                            isActive={activeIcon === icon.type}
                            handlePaint={handlePaint}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.goodBye} onClick={navigateToMainGame}>
                <IconComponent type={'leave'} placeholderImage={leaveIcon.PlaceHolder} frames={leaveIcon.leaveFrames} />
            </div>
        </div>
    );
}

export default ComponentTop;