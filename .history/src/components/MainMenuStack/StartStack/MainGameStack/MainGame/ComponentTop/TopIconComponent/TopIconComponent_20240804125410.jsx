import React, { useState } from 'react';
import styles from './TopIconComponent.module.css';

const TopIconComponent = ({ passiveIcon, activeIcon, type, onClick }) => {
    const [icon, setIcon] = useState(passiveIcon);

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

    // const handleMouseEnter = () => setIcon(activeIcon);
    // const handleMouseLeave = () => setIcon(passiveIcon);
    const handleOnClick = () => {
        onClick && onClick();
        setIcon(activeIcon);
    }
    const defaultStyle = sizeMapping[type] || { width: '50px', height: '50px' };

    return (
        <div
            className={styles.mainDiv}
            onClick={handleOnClick}
            // onMouseEnter={handleMouseEnter}
            // onMouseLeave={handleMouseLeave}
            style={defaultStyle}
        >
            <img src={icon} alt='Icon' style={defaultStyle} />
        </div>
    );
}

export default TopIconComponent;