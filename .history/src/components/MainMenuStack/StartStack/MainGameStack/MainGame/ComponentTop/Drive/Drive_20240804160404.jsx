import React, { useState } from 'react';
import styles from './Drive.module.css';
import { actionCameraImages } from './DriveResourceStack/index'; 

const Drive = () => {
    const [activeImage, setActiveImage] = useState({ back: 0 });

    const handleImageChange = (type) => {
        setActiveImage(prevActiveImage => ({
            ...prevActiveImage,
            [type]: prevActiveImage[type] === 0 ? 1 : 0
        }));
    }

    return (
        <div className={styles.driveDiv}>
            <div className={styles.imageHolders}>
                <img 
                    src={actionCameraImages.back[activeImage.back]} 
                    alt='back' 
                    className={`${styles.backImage} ${activeImage.back === 0 ? styles.active : ''}`} 
                    onClick={() => handleImageChange('back')}
                />
                <img 
                    src={actionCameraImages.front[activeImage.front]} 
                    alt='front' 
                    className={`${styles.frontImage} ${activeImage.front === 0 ? styles.active : ''}`} 
                    onClick={() => handleImageChange('front')}
                />
            </div>
        </div>
    );
}

export default Drive;