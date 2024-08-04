import React from 'react';
import styles from './ComponentTop.module.css';
import { Bucket } from './Bucket/index';

const ComponentTop = () => {
    return (
        <div className={styles.mainDiv}>
            <div className={styles.saveButton}></div>
            <div className={styles.bucketButton}>
                <Bucket />
            </div>
            ComponentTop
        </div>
    );
}

export default ComponentTop;