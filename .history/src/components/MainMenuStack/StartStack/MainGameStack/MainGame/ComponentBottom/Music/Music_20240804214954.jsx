import React, { useState } from 'react';
import styles from './Music.module.css';
import { MusicIcon } from './index';
import { images, checkMarkImages } from './MusicResourceStack/index';

const Music = ({ closeMusic, activeMusic, setActiveMusic }) => {
    const [activeIcon, setActiveIcon] = useState(activeMusic);

    const handleIconClick = (icon) => {
        setActiveMusic(icon);
        setActiveIcon(icon);
    };

    return (
        <div className={styles.musicDiv}>
            <div className={styles.bucketTopRow}>
            {images.map((image, index) => (
                <MusicIcon
                    key={index}
                    bucketIconPassive={icon.passive}
                    bucketIconActive={icon.active}
                    isActive={activeMusic === index}
                    onClick={() => handleIconClick(index)}
                />
            ))}
                <div className={styles.checkmarkDiv}>
                    <MusicIcon
                        bucketIconPassive={checkmarks.passive}
                        bucketIconActive={checkmarks.active}
                        isActive={false}
                        onClick={closeMusic}
                    />
                </div>
            </div>
        </div>
    );
}

export default Music;