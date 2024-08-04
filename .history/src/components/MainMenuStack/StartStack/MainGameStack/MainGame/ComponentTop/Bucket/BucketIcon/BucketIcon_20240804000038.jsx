import React from 'react';
import styles from './BucketIcon.module.css';

const BucketIcon = ({ bucketIcon }) => {
    return (
        <div className={styles.bucketIcon}>
            <img src={bucketIcon} alt='bucket' />
        </div>
    );
}

export default BucketIcon;