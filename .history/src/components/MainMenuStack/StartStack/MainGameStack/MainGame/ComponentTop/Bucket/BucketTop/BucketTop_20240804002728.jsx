import React, { useState } from 'react';
import styles from './BucketTop.module.css';
import { BucketIcon } from '../index';
import images from './BucketTopResourceStack/index';

const BucketTop = ({ activeIcon, onIconClick }) => {

    const icons = [
        { passive: images.MinifigureAnimals2, active: images.MinifigureAnimals5 },
        { passive: images.Building2, active: images.Building5 },
        { passive: images.Vehicles2, active: images.Vehicles5 },
        { passive: images.Scenery2, active: images.Scenery5 },
        { passive: images.Explosives2, active: images.Explosives5 },
        { passive: images.Challenges2, active: images.Challenges5 },
    ];

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