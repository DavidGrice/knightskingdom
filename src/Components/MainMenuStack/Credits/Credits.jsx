import React from "react";
import styles from './Credits.module.css'
import Checkmark2 from './CreditsResourceStack/checkmark_2.png';
import Checkmark4 from './CreditsResourceStack/checkmark_4.png';
import { CommonComponent } from "../../Common";

const Credits = ( { navigateToMenu }) => {

    const handleCheckmarkClick = () => {
        navigateToMenu();
    }

    return (
        <div className={styles.backgroundImage}>
            <div className={styles.textScrollDiv}>
                <div className={styles.textScroll}>
                    <h1>Credits</h1>
                    <h2>Developers</h2>
                    <p>John Doe</p>
                    <p>Jane Doe</p>
                    <h2>Artists</h2>
                    <p>John Doe</p>
                    <p>Jane Doe</p>
                    <h2>Sound Designers</h2>
                    <p>John Doe</p>
                    <p>Jane Doe</p>
                    <h2>Special Thanks</h2>
                    <p>John Doe</p>
                    <p>Jane Doe</p>
                </div>
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
};

export default Credits;