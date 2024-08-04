import React, { useState } from 'react';
import styles from './BottomIconComponent.module.css';

const BottomIconComponent = ({ passiveIcon, activeIcon, isActive, type, onClick }) => {
    const [icon, setIcon] = useState(passiveIcon);
    const [active, setActive] = useState(false);

    const sizeMapping = {
        camera: { width: '63px', height: '65px' },
        climate: { width: '45px', height: '63px' },
        hammer: { width: '62px', height: '65px' },
        music: { width: '62px', height: '65px' },
        target: { width: '62px', height: '65px' },
        zoomIn: { width: '62px', height: '65px' },
        zoomOut: { width: '54px', height: '59px' },
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
                    onClick={onClick}
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

export default BottomIconComponent;