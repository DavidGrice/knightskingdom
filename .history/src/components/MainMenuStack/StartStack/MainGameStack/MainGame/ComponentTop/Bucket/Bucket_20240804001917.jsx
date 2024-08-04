import React, { useState } from 'react';
import styles from './Bucket.module.css';
import { BucketBottom, BucketTop } from './index';

const Bucket = () => {
    const [bucket, setBucket] = useState(null);

    handleBucketClick = () => {
        if (bucket === '')
        console.log('Bucket clicked');
    }

    return (
        <div className={styles.bucketDiv}>
            <BucketTop />
            <BucketBottom />
        </div>
    );
}

export default Bucket;