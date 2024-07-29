import React from "react";
import styles from './HelpComponent.module.css'; // Import the CSS file for styling

const HelpComponent = ({ placeholderImage, spriteSheetImage, onClick }) => {
    return (
        <div 
            className={styles.helpComponent} 
            onClick={onClick} 
            onMouseOver={(e) => e.currentTarget.style.backgroundImage = `url(${spriteSheetImage})`}
            onMouseOut={(e) => e.currentTarget.style.backgroundImage = `url(${placeholderImage})`}
        >
        </div>
    );
}

export default HelpComponent;