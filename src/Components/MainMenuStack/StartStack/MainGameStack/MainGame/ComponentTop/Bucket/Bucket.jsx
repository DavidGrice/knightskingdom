import React, { useState } from 'react';
import styles from './Bucket.module.css';
import { BucketBottom, BucketTop } from './index';

const Bucket = () => {
    const [activeIcon, setActiveIcon] = useState(0);
    const [activeBucket, setActiveBucket] = useState(0);
    const [didUpdate, setDidUpdate] = useState(false);

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
        setActiveBucket(icon);
        setDidUpdate(!didUpdate);
    };

    return (
        <div className={styles.bucketDiv}>
            <BucketTop activeIcon={activeIcon} onIconClick={handleIconClick} />
            <BucketBottom activeBucket={activeBucket} didUpdate={didUpdate} setDidUpdate={setDidUpdate} />
        </div>
    );
};

export default Bucket;