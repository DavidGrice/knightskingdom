import React, { useState } from 'react';
import styles from './TopIconComponent.module.css';

const TopIconComponent = ({ passiveIcon, activeIcon, isActive, type, onClick }) => {
    const [icon, setIcon] = useState(passiveIcon);
    const [active, setActive] = useState(false);

    const sizeMapping = {
        action: { width: '63px', height: '65px' },
        bucket: { width: '45px', height: '63px' },
        delete: { width: '62px', height: '65px' },
        drive: { width: '62px', height: '65px' },
        move: { width: '62px', height: '65px' },
        play: { width: '54px', height: '59px' },
        repaint: { width: '62px', height: '65px' },
        reverse: { width: '62px', height: '65px' },
        save: { width: '56px', height: '58px' },
    };

    const handleOnClick = () => {
        onClick && onClick();
        setActive(!active);
        setIcon(active ? activeIcon : passiveIcon);
    }

    // const handleMouseEnter = () => setIcon(activeIcon);
    // const handleMouseLeave = () => setIcon(passiveIcon);
    const defaultStyle = sizeMapping[type] || { width: '50px', height: '50px' };

    return (
        <>
            {type === 'bucket' ? (
                <div
                    className={styles.mainDiv}
                    onClick={handleOnClick}
                    // onMouseEnter={handleMouseEnter}
                    // onMouseLeave={handleMouseLeave}
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

export default TopIconComponent;