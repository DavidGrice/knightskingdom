import React, { useState } from 'react';
import styles from './IconComponent.module.css';

const IconComponent = ({ passiveIcon, activeIcon, type, onClick }) => {
    const [icon, setIcon] = useState(passiveIcon);

    const sizeMapping = {
        save: { width: '50px', height: '50px' },
        load: { width: '60px', height: '60px' },
        copy: { width: '55px', height: '55px' },
        trash: { width: '45px', height: '45px' },
        // Add more types as needed
    };

    const handleMouseEnter = () => setIcon(activeIcon);
    const handleMouseLeave = () => setIcon(passiveIcon);

    return (
        <div
            className={styles.mainDiv}
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={isHovered ? hoverStyle : defaultStyle}
        >
            <img src={icon} alt='Icon' style={defaultStyle} />
        </div>
    );
}

export default IconComponent;