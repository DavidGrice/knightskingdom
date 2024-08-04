import React, { useState } from 'react';
import styles from './BucketTop.module.css';
import { BucketIcon } from '../index';

const BucketTop = () => {
    return (
        <div className={styles.bucketTop}>
            <div className={styles.bucketTopRow}>
                <BucketIcon bucketIconPassive={'./images/bucket-passive.png'} bucketIconActive={'./images/bucket-active.png'} />
                <BucketIcon bucketIconPassive={'./images/bucket-passive.png'} bucketIconActive={'./images/bucket-active.png'} />
                <BucketIcon bucketIconPassive={'./images/bucket-passive.png'} bucketIconActive={'./images/bucket-active.png'} />
            </div>
            <div className={styles.bucketBottomRow}>
                <BucketIcon bucketIconPassive={'./images/bucket-passive.png'} bucketIconActive={'./images/bucket-active.png'} />
                <BucketIcon bucketIconPassive={'./images/bucket-passive.png'} bucketIconActive={'./images/bucket-active.png'} />
                <BucketIcon bucketIconPassive={'./images/bucket-passive.png'} bucketIconActive={'./images/bucket-active.png'} />
            </div>
        </div>
    );
}

export default BucketTop;