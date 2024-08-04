import React, { useState } from 'react';
import styles from './Drive.module.css';
import { actionCameraImages } from './DriveResourceStack/index'; 

const Drive = () => {
    const [activeImage, setActiveImage] = useState(0);

    const handleImageChange = () => {
        setActiveImage(prevActiveImage => prevActiveImage === 0 ? 1 : 0);
    }

    return (
        <div className={styles.driveDiv}>
            <div className={styles.imageHolders}>
                <img src={actionCameraImages.back[0]} alt='back' className={styles.backImage} />
                <img src={actionCameraImages.front[0]} alt='front' className={styles.frontImage} />
            </div>
        </div>
    );
}

export default Drive;