import React from "react";
import styles from "./WorldHeader.module.css";

const WorldHeader = ({ isLocalWorlds, changeWorld }) => {
    return (
        <div className={styles.headerHolder}>
            <div className={styles.localWorldsHeader} onClick={changeWorld}>
            </div>
            <div className={styles.sharedWorldsHeader} onClick={changeWorld}>
            </div>
        </div>
    );
}

export default WorldHeader;