import React from 'react';
import styles from './Ball.module.css';
import { BottomIconComponent } from '../index';
import { images } from './BallResourceStack/index';

const Ball = () => {
    return (
        <div className={styles.mainDiv}>
            <div className={styles.targetHolder}>
                <BottomIconComponent passiveIcon={images.target[0]} activeIcon={images.target[1]} type={'target'} />
            </div>
            <div className={styles.ballHolder}>
                <img src={images.ballHolderDisabled} alt='Ball Holder' />
            </div>
            <div className={styles.zoomHolder}>
                <BottomIconComponent passiveIcon={images.zoomIn[0]} activeIcon={images.zoomIn[1]} type={'zoomIn'} />
                <BottomIconComponent passiveIcon={images.zoomOut[0]} activeIcon={images.zoomOut[1]} type={'zoomOut'} />
            </div>
        </div>
    )
}

export default Ball;