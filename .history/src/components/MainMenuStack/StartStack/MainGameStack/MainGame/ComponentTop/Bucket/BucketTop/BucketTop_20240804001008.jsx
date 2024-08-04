import React, { useState } from 'react';
import styles from './BucketTop.module.css';
import { BucketIcon } from '../index';
import images from './BucketTopResourceStack/index';

const BucketTop = ({ }) => {

    return (
        <div className={styles.bucketTop}>
            <div className={styles.bucketTopRow}>
                <BucketIcon bucketIconPassive={images.MinifigureAnimals2} bucketIconActive={images.MinifigureAnimals5} />
                <BucketIcon bucketIconPassive={images.Building2} bucketIconActive={images.Building5} />
                <BucketIcon bucketIconPassive={images.Vehicles2} bucketIconActive={images.Vehicles5} />
            </div>
            <div className={styles.bucketBottomRow}>
                <BucketIcon bucketIconPassive={images.Scenery2} bucketIconActive={images.Scenery5} />
                <BucketIcon bucketIconPassive={images.Explosives2} bucketIconActive={images.Explosives5} />
                <BucketIcon bucketIconPassive={images.Challenges2} bucketIconActive={images.Challenges5} />
            </div>
        </div>
    );
}

export default BucketTop;