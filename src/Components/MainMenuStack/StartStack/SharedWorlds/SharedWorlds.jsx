import React from "react";
import styles from "./SharedWorlds.module.css";

const SharedWorlds = ({ navigateToStart }) => {
    return (
        <div className={styles.componentHolder}>
            <div className={styles.headerHolder}>
                <div className={styles.localWorldsHeader}>
                </div>
                <div className={styles.sharedWorldsHeader}>
                </div>
            </div>
            <div className={styles.worldsHolder}>
            </div>
        </div>
    );
}

export default SharedWorlds;