import React, { useState } from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent, Ball } from './index';
import { images } from './ComponentBottomResourceStack/index';
import { HelpComponent } from "../../../../../Common/index";

const ComponentBottom = ({ handleClimate, handleMusic, activeIcon, setActiveIcon, navigateToWorkshop, navigateToSnapshot, handleMusicChange }) => {

    const handleIconClick = (type) => {
        if (type === 'hammer') {
            handleMusicChange(0);
            navigateToWorkshop();
        }
        if (type === 'camera') {
            handleMusicChange(0);
            navigateToSnapshot();
        }
        if (type === 'climate') {
            handleClimate();
        }
        if (type === 'music') {
            handleMusic();
        }
        setActiveIcon(prevActiveIcon => prevActiveIcon === type ? null : type);
    };


    return (
        <div className={styles.componentBottom}>
            <div className={styles.hammerButton}>
                <BottomIconComponent 
                    passiveIcon={images.hammer[0]}
                    activeIcon={images.hammer[1]}
                    isActive={activeIcon === 'hammer'}
                    type={'hammer'}
                    onClick={() => handleIconClick('hammer')} />
            </div>
            <div className={styles.snapShotButton}>
                <BottomIconComponent
                    passiveIcon={images.camera[0]}
                    activeIcon={images.camera[1]}
                    isActive={activeIcon === 'camera'}
                    type={'camera'}
                    onClick={() => handleIconClick('camera')} />
            </div>
            <div className={styles.climateButton}>
                <BottomIconComponent
                    passiveIcon={images.climate[0]}
                    activeIcon={images.climate[1]}
                    isActive={activeIcon === 'climate'}
                    type={'climate'}
                    onClick={() => handleIconClick('climate')} />
            </div>

            <div className={styles.middleDiv}>
                <Ball />
            </div>
            <div className={styles.musicButton}>
                <BottomIconComponent
                    passiveIcon={images.music[0]}
                    activeIcon={images.music[1]}
                    type={'music'}
                    isActive={activeIcon === 'music'}
                    onClick={() => handleIconClick('music')}/>
            </div>
            <div className={styles.bottomRightCorner}>
                <HelpComponent placeholderImage={images.placeholderImage} frames={images.frames} />
            </div>
        </div>
    );
}

export default ComponentBottom;