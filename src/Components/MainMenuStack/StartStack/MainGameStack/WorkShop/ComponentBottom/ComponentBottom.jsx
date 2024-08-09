import React, { useState } from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent, Ball } from './index';
import { images } from './ComponentBottomResourceStack/index';
import { HelpComponent } from "../../../../../Common/index";

const ComponentBottom = ({ activeIcon, setActiveIcon, }) => {

    const handleIconClick = (type) => {
        if (type === 'sweep') {
            console.log('Sweep');
        }
        setActiveIcon(prevActiveIcon => prevActiveIcon === type ? null : type);
    };

    return (
        <div className={styles.componentBottom}>
            <div className={styles.sweepButton}>
                <BottomIconComponent 
                    passiveIcon={images.sweep[0]}
                    activeIcon={images.sweep[1]}
                    isActive={activeIcon === 'sweep'}
                    type={'sweep'}
                    onClick={() => handleIconClick('sweep')} />
            </div>
               
            <div className={styles.middleDiv}>
                <Ball />
            </div>

            <div className={styles.bottomRightCorner}>
                <HelpComponent placeholderImage={images.placeholderImage} frames={images.frames} />
            </div> 

        </div>
    );
}

export default ComponentBottom;