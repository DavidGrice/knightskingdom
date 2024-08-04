import React, { useState } from 'react';
import styles from './BucketIcon.module.css';

const BucketIcon = ({ bucketIconPassive, bucketIconActive }) => {
    const [bucketIcon, setBucketIcon] = useState(bucketIconPassive);

    return (
        <div className={styles.bucketIcon}
             style={{ backgroundImage: `url(${bucketIcon})` }}>
        </div>
    );
}

export default BucketIcon;