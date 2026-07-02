import React from 'react';
import styles from './GameShell.module.css';

const GameShell = ({ mode, top, bottom, children }) => (
    <div className={styles.mainDiv}>
        <div className={styles.topComponent} data-mode={mode}>
            {top}
        </div>
        {children}
        <div className={styles.bottomComponent} data-mode={mode}>
            {bottom}
        </div>
    </div>
);

export default GameShell;