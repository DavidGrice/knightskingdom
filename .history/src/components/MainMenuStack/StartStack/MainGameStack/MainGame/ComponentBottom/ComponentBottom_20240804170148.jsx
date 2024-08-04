import React from 'react';
import styles from './ComponentBottom.module.css';
import { BottomIconComponent } from './index';

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