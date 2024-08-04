import React, { useState } from 'react';
import styles from './Bucket.module.css';
import { BucketBottom, BucketTop } from './index';

const Bucket = () => {
    const [activeIcon, setActiveIcon] = useState(0);
    const [activeBucket, setActiveBucket] = useState(0);

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
        setActiveBucket(icon);
    };

    return (
        <div className={styles.bucketDiv}>
            <BucketTop activeIcon={activeIcon} onIconClick={handleIconClick} />
            <BucketBottom activeBucket={activeBucket} />
        </div>
    );
};

export default Bucket;