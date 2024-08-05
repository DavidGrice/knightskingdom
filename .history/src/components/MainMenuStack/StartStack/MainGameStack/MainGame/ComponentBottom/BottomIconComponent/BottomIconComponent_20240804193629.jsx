import React, { useState } from 'react';
import styles from './BottomIconComponent.module.css';

const BottomIconComponent = ({ passiveIcon, activeIcon, isActive, type, onClick }) => {
    const [icon, setIcon] = useState(passiveIcon);
    const [active, setActive] = useState(false);

    const sizeMapping = {
        camera: { width: '80px', height: '65px' },
        climate: { width: '75px', height: '69px' },
        hammer: { width: '69px', height: '65px' },
        music: { width: '62px', height: '67px' },
        target: { width: '71px', height: '69px' },
        zoomIn: { width: '67px', height: '34px' },
        zoomOut: { width: '67px', height: '38px' },
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