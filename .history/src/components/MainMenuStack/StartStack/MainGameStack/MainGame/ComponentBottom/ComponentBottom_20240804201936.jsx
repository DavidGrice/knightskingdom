import React, { useState } from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent, Ball } from './index';
import { images, frames } from './ComponentBottomResourceStack/index';
import { HelpComponent } from "../../../../../Common/index";

const ComponentBottom = ({ handleClimate, handleMusic }) => {
    const [activeIcon, setActiveIcon] = useState(null);

    const handleIconClick = (type) => {
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
                    type={'hammer'} />
            </div>
            <div className={styles.snapShotButton}>
                <BottomIconComponent
                    passiveIcon={images.camera[0]}
                    activeIcon={images.camera[1]}
                    type={'camera'} />
            </div>
            <div className={styles.climateButton}>
                <BottomIconComponent
                    passiveIcon={images.climate[0]}
                    activeIcon={images.climate[1]}
                    handleClimate={handleClimate}
                    type={'climate'} />
            </div>

            <div className={styles.middleDiv}>
                <Ball />
            </div>
            <div className={styles.musicButton}>
                <BottomIconComponent
                    passiveIcon={images.music[0]}
                    activeIcon={images.music[1]}
                    handleMusic={handleMusic}
                    type={'music'}/>
            </div>
            <div className={styles.bottomRightCorner}>
                <HelpComponent placeholderImage={frames[0]} frames={frames} />
            </div>
        </div>
    );
}

export default ComponentBottom;