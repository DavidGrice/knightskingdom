import React from "react";
import styles from "./LocalWorlds.module.css";

const LocalWorlds = ({ navigateToStart }) => {
    return (
        <div className={styles.componentHolder}>
            <div className={styles.headerHolder}>
                <div className={styles.localWorldsHeader}>
                </div>
                <div className={styles.sharedWorldsHeader}>
                </div>
            </div>
            <div className={styles.worldsHolder}>
                <div className={styles.header}>
                    <div className={styles.upArrow}></div>
                </div>
                <div className={styles.body}></div>
                <div className={styles.footer}></div>
            </div>
        </div>
    );
}

export default LocalWorlds;