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
                <img src={images.ballHolder} alt='Ball Holder' />
            </div>
            
        </div>
    )
}

export default Ball;