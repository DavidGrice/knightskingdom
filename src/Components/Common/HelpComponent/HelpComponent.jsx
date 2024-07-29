import React, { useState, useEffect } from "react";
import styles from './HelpComponent.module.css'; // Import the CSS file for styling

const HelpComponent = ({ backgroundImage, placeholderImage, frames }) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    useEffect(() => {
        let timer;
        const handleMouseEnter = () => {
            timer = setInterval(() => {
                setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
            }, 50); // Adjust the interval as needed
        };
        const handleMouseLeave = () => {
            clearInterval(timer);
            setCurrentFrame(0);
        };
        const element = document.getElementById('help-component');
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
            clearInterval(timer);
        };
    }, []);

    return (
        <div
            className={styles.helpComponent}
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div
            id="help-component"
            className={styles.frameDiv}
            style={{ backgroundImage: `url(${currentFrame === 0 ? placeholderImage : frames[currentFrame]})` }}
            />
        </div>
        
    );
}

export default HelpComponent;