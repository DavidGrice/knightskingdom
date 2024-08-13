import React, { useState } from 'react';
import styles from './ComponentTop.module.css';
import TopIconComponent from './TopIconComponent/TopIconComponent';
import { IconComponent } from "../../../../../Common";
import { leaveIcon } from './ComponentTopResourceStack/index';

const ComponentTop = ({ navigateToStartMenu,
                        handleBucket,
                        handleMove,
                        handleRotate,
                        handlePalette,
                        handleDelete,
                        handleDrive,
                        handleAction,
                        handleSave,
                        handlePaintAndDrive,
                        handlePlay,
                        resetModes,
                        setCameraNeedsReset
                        }) => {
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
        switch (type) {
            case 'bucket':
                handleBucket();
                break;
            case 'move':
                handleMove();
                break;
            case 'reverse':
                handleRotate();
                break;
            case 'repaint':
                handlePalette();
                break;
            case 'delete':
                handleDelete();
                break;
            case 'action':
                handleAction();
                break;
            case 'drive':
                handleDrive();
                setCameraNeedsReset(true);
                break;
            case 'play':
                handlePlay();
                break;
            default:
                resetModes();
                // setCameraNeedsReset(false);
                break;
        }
        setActiveIcon(prevActiveIcon => {
            if (prevActiveIcon === type) {
                resetModes();
                return null;
            } else {
                return type;
            }
        });
    };

    
    return (
        <div className={styles.mainDiv}>
            <div className={styles.saveButton}
            onClick={handleSave}>
                <TopIconComponent 
                    passiveIcon={leaveIcon.iconData.savePassive}
                    activeIcon={leaveIcon.iconData.saveActive}
                    type='save'
                    
                />
            </div>
            <div
                className={styles.bucketButton}
                onClick={() => handleIconClick('bucket')}>
                <TopIconComponent 
                    passiveIcon={leaveIcon.iconData.bucketPassive} 
                    activeIcon={leaveIcon.iconData.bucketActive} 
                    type='bucket' 
                    isActive={activeIcon === 'bucket'} 
                    
                />
            </div>
            <div className={styles.middleDiv}>
                {topIconComponents.map((icon, index) => (
                    <div
                        key={index}
                        className={icon.className}
                        onClick={() => handleIconClick(icon.type)}>
                        <TopIconComponent
                            passiveIcon={icon.passiveIcon}
                            activeIcon={icon.activeIcon}
                            type={icon.type}
                            isActive={activeIcon === icon.type}
                            handlePaintAndDrive={handlePaintAndDrive}
                            resetModes={resetModes}
                            
                        />
                    </div>
                ))}
            </div>
            <div className={styles.driveAction}
                 onClick={handlePlay}>
                <TopIconComponent
                passiveIcon={leaveIcon.iconData.playPassive}
                activeIcon={leaveIcon.iconData.playActive}
                type='play'
                
                />
            </div>
            <div className={styles.goodBye} onClick={navigateToStartMenu}>
                <IconComponent type={'leave'}
                placeholderImage={leaveIcon.placeHolder}
                frames={leaveIcon.leaveFrames}
                
                />
            </div>
        </div>
    );
}

export default ComponentTop;