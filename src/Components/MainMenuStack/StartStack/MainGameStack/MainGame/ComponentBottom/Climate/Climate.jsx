import React, { useState, useEffect } from 'react';
import styles from './Climate.module.css';
import { ClimateIcon } from './index';
import { images, checkmarks } from './ClimateResourceStack/index';

const Climate = ({ closeClimate, activeWeather, handleWeatherChange }) => {
    const [activeIcon, setActiveIcon] = useState(activeWeather);

    // useEffect(() => {
    //     // Update the active icon based on selectedClimateMode
    //     setActiveIcon(selectedClimateMode);
    // }, [selectedClimateMode]);

    const handleIconClick = (icon) => {
        handleWeatherChange(icon);
    };

    return (
        <div className={styles.climateDiv}>
            <div className={styles.bucketTopRow}>
                {images.map((icon, index) => (
                    <ClimateIcon
                        key={index}
                        bucketIconPassive={icon.passive}
                        bucketIconActive={icon.active}
                        isActive={activeWeather === index}
                        onClick={() => handleIconClick(index)}
                    />
                ))}
                <div className={styles.checkmarkDiv}>
                    <ClimateIcon
                        bucketIconPassive={checkmarks.passive}
                        bucketIconActive={checkmarks.active}
                        isActive={false}
                        onClick={closeClimate}
                    />
                </div>
            </div>
        </div>
    );
}

export default Climate;