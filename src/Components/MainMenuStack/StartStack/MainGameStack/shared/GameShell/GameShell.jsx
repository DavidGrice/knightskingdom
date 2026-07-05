import React from 'react';
import styles from './GameShell.module.css';

const GameShell = ({ mode, top, bottom, children }) => (
    <div className={styles.mainDiv} data-testid="game-shell">
        <div className={styles.topComponent} data-mode={mode} data-testid="game-shell-top">
            {top}
        </div>
        {children}
        <div className={styles.bottomComponent} data-mode={mode} data-testid="game-shell-bottom">
            {bottom}
        </div>
    </div>
);

export default GameShell;