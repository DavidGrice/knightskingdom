import React, { useState } from "react";
import styles from "./Start.module.css";
import { World } from "..";

const Start = ({ navigateToMainMenu }) => {
    return (
        <div className={styles.backgroundImage}>
            <div className={styles.centeredContainer}>
                <World navigateToMainMenu={navigateToMainMenu} />
            </div>  
        </div>
    );
    }

export default Start;