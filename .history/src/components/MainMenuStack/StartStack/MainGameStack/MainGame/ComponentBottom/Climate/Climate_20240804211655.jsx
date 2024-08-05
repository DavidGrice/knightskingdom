import React, { useState } from 'react';
import styles from './Climate.module.css';
import { ClimateIcon } from './index';
import { images, checkmarks } from './ClimateResourceStack/index';

const Climate = ({ closeClimate }) => {
    const [activeIcon, setActiveIcon] = useState(0);

    const handleIconClick = (icon) => {
        setActiveIcon(icon);
    };

    const handleCheckmarkClick = () => {
        setActiveIcon(0); // Reset the active icon
        closeClimate(); // Close the climate window
    };

    return (
        <div className={styles.climateDiv}>
            <div className={styles.bucketTopRow}>
                {images.map((icon, index) => (
                    <ClimateIcon
                        key={index}
                        bucketIconPassive={icon.passive}
                        bucketIconActive={icon.active}
                        isActive={activeIcon === index}
                        onClick={() => handleIconClick(index)}
                    />
                ))}
                <div className={styles.checkmarkDiv}>
                    <ClimateIcon
                        bucketIconPassive={checkmarks.passive}
                        bucketIconActive={checkmarks.active}
                        isActive={false}
                        onClick={handleCheckmarkClick}
                    />
                </div>
            </div>
        </div>
    );
}

export default Climate;