import React from 'react';
import styles from './MusicIcon.module.css';

const MusicIcon = ({ bucketIconPassive, bucketIconActive, isActive, onClick }) => {
    return (
        <div className={styles.musicIcon} onClick={onClick}>
            <img src={isActive ? bucketIconActive : bucketIconPassive} alt="bucketIcon" />
        </div>
    );
}

export default MusicIcon;