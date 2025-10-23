import React, { useEffect } from 'react';
import styles from './SnapShot.module.css';
import { SnapShotHolder } from './index';
import { checkmarks } from './SnapShotResourceStack/index';
import { CommonComponent } from "../../../../Common/index";


const SnapShot = ({ navigateToMainGame, mapData }) => {

    const handleCheckmarkClick = () => {
        navigateToMainGame(mapData);
        console.log(mapData);
    }

    return (
        <div className={styles.snapShotDiv}>
            <SnapShotHolder />
            <div className={styles.bottomLeftCorner}>
                <CommonComponent 
                    initialImage={checkmarks.checkMark2} 
                    hoverImage={checkmarks.checkMark4} 
                    altText="Checkmark" 
                    onClick={handleCheckmarkClick} // Add onClick handler
                />
            </div>  
        </div>
    );
}

export default SnapShot;