import React, { useState } from 'react';
import styles from './BucketTop.module.css';
import { BucketIcon } from '../index';
import icons from './BucketTopResourceStack/index';

const BucketTop = ({ activeIcon, onIconClick }) => {



    return (
        <div className={styles.bucketTop}>
            <div className={styles.bucketTopRow}>
                {icons.map((icon, index) => (
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
};

export default BucketTop;