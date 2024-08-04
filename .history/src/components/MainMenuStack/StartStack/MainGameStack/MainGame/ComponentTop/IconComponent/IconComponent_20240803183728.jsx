import React, { useState } from 'react';
import styles from './IconComponent.module.css';

const IconComponent = ({ icon, type, onClick }) => {
    return (
        <div className={styles.mainDiv} onClick={onClick}>
            <img src={icon} alt='Icon'></img>
        </div>
    );
}