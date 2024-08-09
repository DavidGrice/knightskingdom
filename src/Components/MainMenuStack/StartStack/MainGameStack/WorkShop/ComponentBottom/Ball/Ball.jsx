import React, { useState } from 'react';
import styles from './Ball.module.css';
import BottomIconComponent from '../BottomIconComponent/BottomIconComponent';
import { images } from './BallResourceStack/index';

const Ball = () => {
    const [activeIcon, setActiveIcon] = useState(null);

    const handleIconClick = (type) => {
        setActiveIcon(prevActiveIcon => prevActiveIcon === type ? null : type);
    };

    return (
        <div className={styles.mainDiv}>
            <div className={styles.zoomHolder}>
                <BottomIconComponent 
                    passiveIcon={images.zoomIn[0]} 
                    activeIcon={images.zoomIn[1]}
                    isActive={activeIcon === 'zoomIn'} 
                    type={'zoomIn'} 
                    onClick={() => handleIconClick('zoomIn')}/>
                <BottomIconComponent 
                    passiveIcon={images.zoomOut[0]}
                    activeIcon={images.zoomOut[1]}
                    isActive={activeIcon === 'zoomOut'}
                    type={'zoomOut'}
                    onClick={()=> handleIconClick('zoomOut')}/>
            </div>
            <div className={styles.ballHolder}>
                <img src={images.ballHolderDisabled} alt='Ball Holder' />
            </div>
        </div>
    )
}

export default Ball;