import React, { useState } from 'react';
import styles from './ComponentTopIcon.module.css';

const ComponentTopIcon = ({ passiveIcon, activeIcon, isActive, type, onClick, handlePaint }) => {
    const [icon, setIcon] = useState(passiveIcon);
    const [active, setActive] = useState(false);

    const sizeMapping = {
        bucket: { width: '45px', height: '63px' },
        delete: { width: '63px', height: '65px' },
        duplicate: { width: '62px', height: '65px' },
        move: { width: '62px', height: '65px' },
        repaint: { width: '62px', height: '65px' },
        reverse: { width: '62px', height: '65px' },
        save: { width: '58px', height: '60px' },
    };

    const handleOnClick = () => {
        onClick && onClick();
        if (active) {
            setIcon(passiveIcon);
            setActive(false);
        } else {
            setIcon(activeIcon);
            setActive(true);
        }
    }

    const handlePaintCase = () => {
        handlePaint && handlePaint();
        onClick && onClick();
    }

    const defaultStyle = sizeMapping[type] || { width: '50px', height: '50px' };

    return (
        <>
            {type === 'bucket' || type === 'play' || type ==='save' ? (
                <div
                    className={styles.mainDiv}
                    onClick={handleOnClick}
                    style={defaultStyle}
                >
                    <img src={icon} alt='Icon' style={defaultStyle} />
                </div>
            ) : (
                <div
                    className={styles.mainDiv}
                    onClick={handlePaintCase}
                    // onMouseEnter={handleMouseEnter}
                    // onMouseLeave={handleMouseLeave}
                    style={defaultStyle}
                >
                    <img src={isActive ? activeIcon : passiveIcon} alt='Icon' style={defaultStyle} />
                </div>
            )}
        </>
    );
}

export default ComponentTopIcon;