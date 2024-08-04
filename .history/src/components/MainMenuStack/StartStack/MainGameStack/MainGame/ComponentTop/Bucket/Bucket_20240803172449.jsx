import React from 'react';
import styles from './Bucket.module.css';
import { BucketBottom, BucketTop } from './index';

const Bucket = () => {
    return (
        <div className={styles.Bucket}>
            <BucketTop />
            <BucketBottom />
        </div>
    );
}

export default Bucket;