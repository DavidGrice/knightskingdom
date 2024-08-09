import React, { useState } from 'react';
import styles from './BottomIconComponent.module.css';

const BottomIconComponent = ({ passiveIcon, activeIcon, isActive, type, onClick }) => {
    const [icon, setIcon] = useState(passiveIcon);
    const [active, setActive] = useState(false);

    const sizeMapping = {
        sweep: { width: '68px', height: '69px' },
        zoomIn: { width: '67px', height: '34px' },
        zoomOut: { width: '67px', height: '38px' },
    };

    const defaultStyle = sizeMapping[type] || { width: '50px', height: '50px' };

    return (
        <div
            className={styles.mainDiv}
            onClick={onClick}
            style={defaultStyle}
        >
            <img src={isActive ? activeIcon : passiveIcon} alt='Icon' style={defaultStyle} />
        </div>
    );
}

export default BottomIconComponent;