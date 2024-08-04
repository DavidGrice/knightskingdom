import React, { useState } from 'react';
import styles from './BucketBottom.module.css';
import images from './BucketBottomResourceStack/index';

const BucketBottom = () => {

    return (
        <div className={styles.bucketBottom}>
            <div className={styles.upArrow}>
                <img src='assets/images/up-arrow.png' alt='up-arrow' />
            </div>
        </div>
    );
}

export default BucketBottom;