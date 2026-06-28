import React, { useState } from 'react';
import gameStyles from './ComponentTop.game.module.css';
import workshopStyles from './ComponentTop.workshop.module.css';
import TopIconComponent from '../TopIconComponent/TopIconComponent';
import { IconComponent } from '../../../../../Common';
import { getTopToolbarConfig } from '../toolbarConfig';

const ComponentTop = ({
    mode,
    navigateToStartMenu,
    navigateToMainGame,
    handleBucket,
    handleMove,
    handleRotate,
    handlePalette,
    handleDelete,
    handleDrive,
    handleAction,
    handleSave,
    handlePlay,
    resetModes,
    setCameraNeedsReset,
    handleMusicChange,
}) => {
    const styles = mode === 'workshop' ? workshopStyles : gameStyles;
    const { leaveIcon, middleIcons, buttonOrder, showPlay } = getTopToolbarConfig(mode);
    const [activeIcon, setActiveIcon] = useState(null);

    const handleGameIconClick = (type) => {
        const isToggleOff = activeIcon === type;

        if (!isToggleOff) {
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
                    break;
            }
        }

        if (isToggleOff) {
            if (type === 'bucket') {
                handleBucket();
            }
            resetModes();
            setActiveIcon(null);
        } else {
            setActiveIcon(type);
        }
    };

    const handleWorkshopIconClick = (type) => {
        if (type === 'repaint') {
            handlePalette();
        }
        setActiveIcon((prevActiveIcon) => (prevActiveIcon === type ? null : type));
    };

    const handleIconClick = mode === 'game' ? handleGameIconClick : handleWorkshopIconClick;

    const handleLeave = () => {
        if (mode === 'game') {
            handleMusicChange(0);
            navigateToStartMenu();
        } else {
            navigateToMainGame();
        }
    };

    const renderSaveButton = () => (
        <div className={styles.saveButton} onClick={handleSave}>
            <TopIconComponent
                passiveIcon={leaveIcon.iconData.savePassive}
                activeIcon={leaveIcon.iconData.saveActive}
                type="save"
            />
        </div>
    );

    const renderBucketButton = () => (
        <div className={styles.bucketButton}>
            <TopIconComponent
                passiveIcon={leaveIcon.iconData.bucketPassive}
                activeIcon={leaveIcon.iconData.bucketActive}
                type="bucket"
                isActive={mode === 'game' ? activeIcon === 'bucket' : undefined}
                onClick={mode === 'game' ? () => handleIconClick('bucket') : handleBucket}
            />
        </div>
    );

    const renderMiddleIcons = () => (
        <div className={styles.middleDiv}>
            {middleIcons.map((icon, index) => (
                <div key={index} className={styles[icon.className]}>
                    <TopIconComponent
                        passiveIcon={icon.passiveIcon}
                        activeIcon={icon.activeIcon}
                        type={icon.type}
                        isActive={activeIcon === icon.type}
                        onClick={() => handleIconClick(icon.type)}
                    />
                </div>
            ))}
        </div>
    );

    const renderPlayButton = () => (
        <div className={styles.driveAction} onClick={handlePlay}>
            <TopIconComponent
                passiveIcon={leaveIcon.iconData.playPassive}
                activeIcon={leaveIcon.iconData.playActive}
                type="play"
            />
        </div>
    );

    const renderLeaveButton = () => (
        <div className={styles.goodBye} onClick={handleLeave}>
            <IconComponent
                type="leave"
                placeholderImage={leaveIcon.placeHolder}
                frames={leaveIcon.leaveFrames}
            />
        </div>
    );

    const sectionRenderers = {
        save: renderSaveButton,
        bucket: renderBucketButton,
        middle: renderMiddleIcons,
        play: showPlay ? renderPlayButton : null,
        leave: renderLeaveButton,
    };

    return (
        <div className={styles.mainDiv}>
            {buttonOrder.map((section) => {
                const renderer = sectionRenderers[section];
                return renderer ? <React.Fragment key={section}>{renderer()}</React.Fragment> : null;
            })}
        </div>
    );
};

export default ComponentTop;