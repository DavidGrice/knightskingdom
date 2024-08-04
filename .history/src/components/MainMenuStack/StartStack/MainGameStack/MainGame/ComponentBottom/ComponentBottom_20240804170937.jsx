import React, { useState } from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent } from './index';
import { images, frames } from './ComponentBottomResourceStack/index';

const ComponentBottom = () => {
    const [activeIcon, setActiveIcon] = useState(null);


    return (
        <div className={styles.componentBottom}>
            <div className={styles.snapShotButton}>
                <BottomIconComponent passiveIcon={camera[0]} activeIcon={camera[1]} />
            </div>
        </div>
    );
}

export default ComponentBottom;