import React, { useState } from 'react';
import styles from './TopIconComponent.module.css';

const TopIconComponent = ({
    passiveIcon,
    activeIcon,
    isActive,
    type,
    onClick,
    resetModes,
}) => {
    const [icon, setIcon] = useState(passiveIcon);
    const [active, setActive] = useState(false);

    const sizeMapping = {
        action: { width: '63px', height: '65px' },
        bucket: { width: '45px', height: '63px' },
        delete: { width: '63px', height: '65px' },
        duplicate: { width: '62px', height: '65px' },
        drive: { width: '62px', height: '65px' },
        move: { width: '62px', height: '65px' },
        play: { width: '54px', height: '59px' },
        repaint: { width: '62px', height: '65px' },
        reverse: { width: '62px', height: '65px' },
        save: { width: '58px', height: '60px' },
    };

    const defaultStyle = sizeMapping[type] || { width: '50px', height: '50px' };
    const isControlled = isActive !== undefined;
    const usesInternalToggle = type === 'play' || type === 'save' || (type === 'bucket' && !isControlled);

    const handleInternalToggle = () => {
        onClick?.();
        if (active) {
            setIcon(passiveIcon);
            setActive(false);
            resetModes?.();
        } else {
            setIcon(activeIcon);
            setActive(true);
        }
    };

    if (isControlled) {
        return (
            <div className={styles.mainDiv} onClick={onClick} style={defaultStyle}>
                <img src={isActive ? activeIcon : passiveIcon} alt="Icon" style={defaultStyle} />
            </div>
        );
    }

    if (usesInternalToggle) {
        return (
            <div className={styles.mainDiv} onClick={handleInternalToggle} style={defaultStyle}>
                <img src={icon} alt="Icon" style={defaultStyle} />
            </div>
        );
    }

    return (
        <div className={styles.mainDiv} onClick={onClick} style={defaultStyle}>
            <img src={isActive ? activeIcon : passiveIcon} alt="Icon" style={defaultStyle} />
        </div>
    );
};

export default TopIconComponent;