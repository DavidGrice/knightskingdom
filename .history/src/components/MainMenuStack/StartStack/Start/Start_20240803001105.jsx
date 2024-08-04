import React, { useState } from "react";
import styles from "./Start.module.css";
import { World } from "..";
import { CommonComponent, IconComponent } from "../../../Common";
import { leaveIcon } from "./StartResourceStack/index";
import Checkmark2 from './StartResourceStack/checkmark_2.png';
import Checkmark4 from './StartResourceStack/checkmark_4.png';

const Start = ({ navigateToMenu, navigateToMainGame }) => {
    const [worldData, setWorldData] = useState(null);

    const handleCheckmarkClick = () => {
        navigateToMainGame(worldData);
        console.log(worldData);
    }

    const handleLeaveClick = () => {
        navigateToMenu();
    }

    return (
        <div className={styles.backgroundImage}>
            <div className={styles.topRightCorner} onClick={handleLeaveClick}>
                <IconComponent type={'leave'} placeholderImage={leaveIcon.placeholderIcon} frames={leaveIcon.startFrames} />
            </div>
            <div className={styles.centeredContainer}>
                <World navigateToMainMenu={navigateToMenu} setWorldData={setWorldData} />
            </div>
            <div className={styles.bottomLeftCorner}>
                <CommonComponent 
                    initialImage={Checkmark2} 
                    hoverImage={Checkmark4} 
                    altText="Checkmark" 
                    onClick={handleCheckmarkClick} // Add onClick handler
                />
            </div>  
        </div>
    );
}

export default Start;