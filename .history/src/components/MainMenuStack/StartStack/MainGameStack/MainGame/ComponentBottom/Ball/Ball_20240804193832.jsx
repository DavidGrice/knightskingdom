import React from 'react';
import styles from './Ball.module.css';
import { BottomIconComponent } from '../index';
import { images } from './BallResourceStack/index';

const Ball = () => {
    return (
        <div className={styles.mainDiv}>
            <BottomIconComponent passiveIcon={images.target[0]} activeIcon={images.target[1]} />
        </div>
    )
}

export default Ball;