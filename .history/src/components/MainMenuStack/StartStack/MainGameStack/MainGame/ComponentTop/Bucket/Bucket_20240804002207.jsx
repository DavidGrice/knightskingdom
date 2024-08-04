import React, { useState } from 'react';
import BucketTop from './BucketTop';
import BucketBottom from './BucketBottom';
import styles from './Bucket.module.css';

const Bucket = () => {
    const [activeIcon, setActiveIcon] = useState(null);

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
    };

    return (
        <div className={styles.bucket}>
            <BucketTop activeIcon={activeIcon} onIconClick={handleIconClick} />
            <BucketBottom activeIcon={activeIcon} />
        </div>
    );
};

export default Bucket;