import React from "react";
import styles from './OptionsMenuPlaceholder.module.css';

const OptionsMenuPlaceholder = ({
    isTop,
    ring,
    leftImageDark,
    leftImageLight,
    middleImageDark,
    middleImageLight,
    rightImageDark,
    rightImageLight,
    activeSide,
    onSelect,
}) => {
    const leftImage = activeSide === 'left' ? leftImageLight : leftImageDark;
    const middleImage = activeSide === 'middle' ? middleImageLight : middleImageDark;
    const rightImage = activeSide === 'right' ? rightImageLight : rightImageDark;

    return (
        <div className={`${styles.ring}`} style={{ backgroundImage: `url(${ring})` }}>
            <div
                className={`${styles.left} ${isTop ? styles.topLeft : styles.defaultLeft}`}
                style={{ backgroundImage: `url(${leftImage})` }}
                onClick={() => onSelect('left')}
            />
            {isTop && (
                <div
                    className={`${styles.middle} ${styles.topMiddle}`}
                    style={{ backgroundImage: `url(${middleImage})` }}
                    onClick={() => onSelect('middle')}
                />
            )}
            <div
                className={`${styles.right} ${isTop ? styles.topRight : styles.defaultRight}`}
                style={{ backgroundImage: `url(${rightImage})` }}
                onClick={() => onSelect('right')}
            />
        </div>
    );
}

export default OptionsMenuPlaceholder;