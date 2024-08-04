import React from 'react';
import styles from './Drive.module.css';
import { actionCameraImages } from './DriveResourceStack/index'; 

const Drive = () => {
    return (
        <div className={styles.driveDiv}>
            <div className={styles.imageHolders}>
                <img src={actionCameraImages.front[0]} alt='front' className={styles.frontImage} />
                <img src={actionCameraImages.back[0]} alt='back' className={styles.backImage} />
            </div>
        </div>
    );
}

export default Drive;