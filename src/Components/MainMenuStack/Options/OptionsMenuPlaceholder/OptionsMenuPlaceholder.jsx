import React, { useState } from "react";
import styles from './OptionsMenuPlaceholder.module.css';

const OptionsMenuPlaceholder = ({ isTop, ring, leftImageDark, leftImageLight, middleImageDark, middleImageLight, rightImageDark, rightImageLight }) => {
    const [leftImage, setLeftImage] = useState(leftImageLight);
    const [middleImage, setMiddleImage] = useState(middleImageDark);
    const [rightImage, setRightImage] = useState(rightImageDark);

    const handleLeftClick = () => {
        if (isTop) {
            setLeftImage(leftImageLight);
            setMiddleImage(middleImageDark);
            setRightImage(rightImageDark);
        } else {
            setLeftImage(leftImageLight);
            setRightImage(rightImageDark);
        }
    };

    const handleMiddleClick = () => {
        setLeftImage(leftImageDark);
        setMiddleImage(middleImageLight);
        setRightImage(rightImageDark);
    };

    const handleRightClick = () => {
        if (isTop) {
            setLeftImage(leftImageDark);
            setMiddleImage(middleImageDark);
            setRightImage(rightImageLight);
        } else {
            setLeftImage(leftImageDark);
            setRightImage(rightImageLight);
        }
    };

    return (
        <div className={`${styles.ring}`} style={{ backgroundImage: `url(${ring})` }}>
            <div
                className={`${styles.left} ${isTop ? styles.topLeft : styles.defaultLeft}`}
                style={{ backgroundImage: `url(${leftImage})` }}
                onClick={handleLeftClick}
            ></div>
            {isTop && (
                <div 
                    className={`${styles.middle} ${styles.topMiddle}`} 
                    style={{ backgroundImage: `url(${middleImage})` }}
                    onClick={handleMiddleClick}
                ></div>
            )}
            <div
                className={`${styles.right} ${isTop ? styles.topRight : styles.defaultRight}`}
                style={{ backgroundImage: `url(${rightImage})` }}
                onClick={handleRightClick}
            ></div>
        </div>
    );
}

export default OptionsMenuPlaceholder;