import React, { useState } from 'react';
import styles from './Climate.module.css';
import { ClimateIcon } from './index';
import { images, checkmarks } from './ClimateResourceStack/index';

const Climate = ({ closeClimate, activeWeather, setActiveWeather}) => {
    // const [activeIcon, setActiveIcon] = useState(0);

    const handleIconClick = (icon) => {
        setActiveWeather(icon);
        setActiveIcon(icon);
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