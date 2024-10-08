import React, { useState } from 'react';
import styles from './TopIconComponent.module.css';

const TopIconComponent = ({ passiveIcon, activeIcon, isActive, type, onClick, handlePaintAndDrive, resetModes }) => {
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
        if (active) {
            setIcon(passiveIcon);
            setActive(false);
            resetModes && resetModes();
            // onDeselect && onDeselect();
        } else {
            setIcon(activeIcon);
            setActive(true);
        }
    }

    const handlePaintDrive = () => {
        handlePaintAndDrive && handlePaintAndDrive();
        onClick && onClick();
        if (active) {
            setIcon(passiveIcon);
            setActive(false);
            resetModes && resetModes();
            // onDeselect && onDeselect();
        } else {
            setIcon(activeIcon);
            setActive(true);
        }
    }

    const defaultStyle = sizeMapping[type] || { width: '50px', height: '50px' };

    return (
        <>
            {type === 'play' || type ==='save' ? (
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
                    onClick={handlePaintDrive}
                    style={defaultStyle}
                >
                    <img src={isActive ? activeIcon : passiveIcon} alt='Icon' style={defaultStyle} />
                </div>
            )}
        </>
    );
}

export default TopIconComponent;