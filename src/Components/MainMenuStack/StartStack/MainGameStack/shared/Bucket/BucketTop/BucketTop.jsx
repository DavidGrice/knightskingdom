import React from 'react';
import styles from './BucketTop.module.css';
import BucketIcon from '../BucketIcon/BucketIcon';

const BucketTop = ({ tabIcons, activeIcon, onIconClick }) => (
    <div className={styles.bucketTop}>
        <div className={styles.bucketTopRow}>
            {tabIcons.map((icon, index) => (
                <BucketIcon
                    key={index}
                    bucketIconPassive={icon.passive}
                    bucketIconActive={icon.active}
                    isActive={activeIcon === index}
                    onClick={() => onIconClick(index)}
                />
            ))}
        </div>
    </div>
);

export default BucketTop;