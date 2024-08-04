import React from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent } from './index';
import { images, frames } from './ComponentBottomResourceStack/index';

const ComponentBottom = () => {
    return (
        <div className={styles.componentBottom}>
            <div className={styles.snapShotButton}>
                <BottomIconComponent />
            </div>
        </div>
    );
}

export default ComponentBottom;