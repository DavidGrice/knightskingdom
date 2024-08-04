import React from 'react';
import styles from './IconComponent.module.css';

const IconComponent = ({ icon, onClick }) => {
    return (
        <div className={styles.mainDiv} onClick={onClick}>
            <img src={icon} alt='Icon'></img>
        </div>
    );
}