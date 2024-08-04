import React from 'react';
import styles from './BucketTop.module.css';
import { BucketIcon } from '../index';

const BucketTop = () => {
    return (
        <div className={styles.bucketTop}>
            <div className={styles.bucketTopRow}>
                <div className={styles.bucketTopRowItem}>1</div>
                <div className={styles.bucketTopRowItem}>2</div>
                <div className={styles.bucketTopRowItem}>3</div>
            </div>
            <div className={styles.bucketBottomRow}>
                <div className={styles.bucketBottomRowItem}>4</div>
                <div className={styles.bucketBottomRowItem}>5</div>
                <div className={styles.bucketBottomRowItem}>6</div>
            </div>
        </div>
    );
}

export default BucketTop;