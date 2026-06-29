// src/components/MainMenuStack/StartStack/MainGameStack/MainGame/ComponentTop/Drive/Drive.jsx
import React, { useState, useEffect } from 'react';
import styles from './Drive.module.css';
import { actionCameraImages } from './DriveResourceStack/index';

const Drive = ({ activeCamera, handleCameraSwitch, cameraNeedsReset, setCameraNeedsReset }) => {
    const [activeImage, setActiveImage] = useState({ back: 1, front: 0 });

    useEffect(() => {
        if (activeCamera === 'front') {
            setActiveImage({ back: 0, front: 1 });
        } else {
            setActiveImage({ back: 1, front: 0 });
        }
    }, [activeCamera]);

    useEffect(() => {
        if (cameraNeedsReset) {
            setCameraNeedsReset(false);
        }
    }, [cameraNeedsReset, setCameraNeedsReset]);

    const handleImageChange = (type) => {
        if (type === 'back') {
            setActiveImage({ back: 1, front: 0 });
            handleCameraSwitch('back');
        } else if (type === 'front') {
            setActiveImage({ back: 0, front: 1 });
            handleCameraSwitch('front');
        }
    }

    return (
        <div className={styles.driveDiv}>
            <div className={styles.imageHolders}>
                <img 
                    src={actionCameraImages.back[activeImage.back]} 
                    alt='back' 
                    className={`${styles.backImage} ${activeImage.back === 1 ? styles.active : ''}`} 
                    onClick={() => handleImageChange('back')}
                />
                <img 
                    src={actionCameraImages.front[activeImage.front]} 
                    alt='front' 
                    className={`${styles.frontImage} ${activeImage.front === 1 ? styles.active : ''}`} 
                    onClick={() => handleImageChange('front')}
                />
            </div>
        </div>
    );
}

export default Drive;