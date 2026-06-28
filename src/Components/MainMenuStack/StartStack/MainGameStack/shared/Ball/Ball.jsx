import React, { useState } from 'react';
import gameStyles from './Ball.game.module.css';
import workshopStyles from './Ball.workshop.module.css';
import BottomIconComponent from '../BottomIconComponent/BottomIconComponent';
import { getBottomToolbarConfig } from '../toolbarConfig';

const Ball = ({ mode }) => {
    const styles = mode === 'workshop' ? workshopStyles : gameStyles;
    const { ballImages, showTarget } = getBottomToolbarConfig(mode);
    const [activeIcon, setActiveIcon] = useState(null);

    const handleIconClick = (type) => {
        setActiveIcon((prevActiveIcon) => (prevActiveIcon === type ? null : type));
    };

    return (
        <div className={styles.mainDiv}>
            <div className={styles.zoomHolder}>
                <BottomIconComponent
                    passiveIcon={ballImages.zoomIn[0]}
                    activeIcon={ballImages.zoomIn[1]}
                    isActive={activeIcon === 'zoomIn'}
                    type="zoomIn"
                    onClick={() => handleIconClick('zoomIn')}
                />
                <BottomIconComponent
                    passiveIcon={ballImages.zoomOut[0]}
                    activeIcon={ballImages.zoomOut[1]}
                    isActive={activeIcon === 'zoomOut'}
                    type="zoomOut"
                    onClick={() => handleIconClick('zoomOut')}
                />
            </div>
            <div className={styles.ballHolder}>
                <img src={ballImages.ballHolderDisabled} alt="Ball Holder" />
            </div>
            {showTarget && (
                <div className={styles.targetHolder}>
                    <BottomIconComponent
                        passiveIcon={ballImages.target[0]}
                        activeIcon={ballImages.target[1]}
                        isActive={activeIcon === 'target'}
                        type="target"
                        onClick={() => handleIconClick('target')}
                    />
                </div>
            )}
        </div>
    );
};

export default Ball;