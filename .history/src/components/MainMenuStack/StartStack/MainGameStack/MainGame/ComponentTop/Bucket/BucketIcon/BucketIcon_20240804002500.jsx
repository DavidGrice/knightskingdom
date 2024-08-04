import React from 'react';
import styles from './BucketIcon.module.css';

const BucketIcon = ({ bucketIconPassive, bucketIconActive, isActive, onClick }) => {
    const icon = isActive ? bucketIconActive : bucketIconPassive;

    return (
        <div
            className={styles.bucketIcon}
            onClick={onClick}
            style={{ backgroundImage: `url(${icon})` }}
        >
            <img src={icon} alt='bucket' />
        </div>
    );
};

export default BucketIcon;