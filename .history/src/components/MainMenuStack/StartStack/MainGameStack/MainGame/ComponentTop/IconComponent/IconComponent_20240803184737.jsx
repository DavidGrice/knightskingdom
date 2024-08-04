import React, { useState } from 'react';
import styles from './IconComponent.module.css';

const IconComponent = ({ passiveIcon, activeIcon, type, onClick }) => {
    const [icon, setIcon] = useState(passiveIcon);

    const sizeMapping = {
        action: { width: '63px', height: '65px' },
        delete: { width: '62px', height: '65px' },
        drive: { width: '62px', height: '65px' },
        move: { width: '62px', height: '65px' },
        copy: { width: '55px', height: '55px' },
        trash: { width: '45px', height: '45px' },
    };

    const handleMouseEnter = () => setIcon(activeIcon);
    const handleMouseLeave = () => setIcon(passiveIcon);
    const defaultStyle = sizeMapping[type] || { width: '50px', height: '50px' };

    return (
        <div
            className={styles.mainDiv}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={defaultStyle}
        >
            <img src={icon} alt='Icon' style={defaultStyle} />
        </div>
    );
}

export default IconComponent;