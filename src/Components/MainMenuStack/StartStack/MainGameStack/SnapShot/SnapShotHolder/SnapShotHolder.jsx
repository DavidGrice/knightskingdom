import React from 'react';
import styles from './SnapShotHolder.module.css';
import SnapShotBody from './SnapShotBody/SnapShotBody';

const SnapShotHolder = () => {
    return (
        <div className={styles.componentHolder}>
            <SnapShotBody />
        </div>
    );
}

export default SnapShotHolder;