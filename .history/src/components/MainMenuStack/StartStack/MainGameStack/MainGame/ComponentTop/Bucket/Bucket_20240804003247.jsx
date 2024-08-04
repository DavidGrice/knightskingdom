import React, { useState } from 'react';
import styles from './Bucket.module.css';
import { BucketBottom, BucketTop } from './index';

const Bucket = () => {
    const [activeIcon, setActiveIcon] = useState(0);

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
    };

    return (
        <div className={styles.bucketDiv}>
            <BucketTop activeIcon={activeIcon} onIconClick={handleIconClick} />
            <BucketBottom activeIcon={activeIcon} />
        </div>
    );
};

export default Bucket;