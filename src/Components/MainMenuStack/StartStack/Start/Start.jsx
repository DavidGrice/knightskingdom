import React, { useState } from "react";
import styles from "./Start.module.css";
import { LocalWorlds, SharedWorlds } from "..";

const Start = ({ navigateToMainMenu }) => {
    const [localWorlds, setLocalWorlds] = useState(true);
    const [sharedWorlds, setSharedWorlds] = useState(false);


    return (
        <div className={styles.backgroundImage}>
            <div className={styles.centeredContainer}>
                {localWorlds ? 
                    <LocalWorlds /> 
                    : <SharedWorlds />}
            </div>  
        </div>
    );
    }

export default Start;