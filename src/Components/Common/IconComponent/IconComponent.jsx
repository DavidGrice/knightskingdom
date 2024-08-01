import React, { useState, useEffect } from "react";
import styles from "./IconComponent.module.css";

const IconComponent = ({ type, backgroundImage, placeholderImage, frames }) => {
    const [currentFrame, setCurrentFrame] = useState(0);
    const [typeImage, setTypeImage] = useState(type);
    const [typeId, setTypeId] = useState(null);
    useEffect(() => {
        let timer;
        const handleMouseEnter = () => {
            timer = setInterval(() => {
                setCurrentFrame((prevFrame) => (prevFrame + 1) % frames.length);
            }, 50);
        };
        const handleMouseLeave = () => {
            clearInterval(timer);
            setCurrentFrame(0);
        };

        if (type === "save") {
            setTypeId("#save-component");
        } else if (type === "load") {
            setTypeId("#load-component");
        } else if (type === "copy") {
            setTypeId("#copy-component");
        } else if (type === "trash") {
            setTypeId("#trash-component");
        } else if (type === "leave") {
            setTypeId("#leave-component");
        }

        const element = document.getElementById(typeImage);
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
            className={styles.iconComponent}
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div
            id={typeImage}
            className={styles.frameDiv}
            style={{ backgroundImage: `url(${currentFrame === 0 ? placeholderImage : frames[currentFrame]})` }}
            />
        </div>
        
    );
}

export default IconComponent;