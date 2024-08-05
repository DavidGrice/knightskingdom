import React, { useState } from 'react';
import styles from './Climate.module.css';
import { images } from './ClimateResourceStack/index';

const Climate = () => {
    const [activeIcon, setActiveIcon] = useState(0);

    return (
        <div className={styles.climateDiv}>
            <div className={styles.bucketTopRow}>
                {images.map((icon, index) => (
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
}

export default Climate;