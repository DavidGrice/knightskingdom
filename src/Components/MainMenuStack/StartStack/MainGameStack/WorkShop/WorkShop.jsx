import React from 'react';
import styles from './WorkShop.module.css';
import { ComponentTop, ComponentBottom } from './index';

const WorkShop = () => {
    return (
        <div className={styles.mainDiv}>
            <div className={styles.topComponent}>
                <ComponentTop />
            </div>
        </div>
    );
}

export default WorkShop;