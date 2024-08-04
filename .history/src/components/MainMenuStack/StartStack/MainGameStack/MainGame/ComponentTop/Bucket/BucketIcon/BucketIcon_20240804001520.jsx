import React, { useState } from 'react';
import styles from './BucketIcon.module.css';

const BucketIcon = ({ bucketIconPassive, bucketIconActive }) => {
    const [bucketIcon, setBucketIcon] = useState(bucketIconPassive);

    return (
        <div className={styles.bucketIcon}
            <img src={bucketIcon} alt='bucket' />
        </div>
    );
}

export default BucketIcon;