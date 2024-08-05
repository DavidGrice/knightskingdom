import React from 'react';
import styles from './ClimateIcon.module.css';

const ClimateIcon = ({ bucketIconPassive, bucketIconActive, isActive, onClick }) => {
    return (
        <div className={styles.bucketIcon} onClick={onClick}>
            <img src={isActive ? bucketIconActive : bucketIconPassive} alt="bucketIcon" />
        </div>
    );
}

export default ClimateIcon;