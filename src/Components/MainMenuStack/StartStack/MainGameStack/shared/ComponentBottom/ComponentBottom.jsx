import React from 'react';
import gameStyles from './ComponentBottom.game.module.css';
import workshopStyles from './ComponentBottom.workshop.module.css';
import BottomIconComponent from '../BottomIconComponent/BottomIconComponent';
import Ball from '../Ball/Ball';
import { HelpComponent } from '../../../../../Common';
import { getBottomToolbarConfig } from '../toolbarConfig';

const ComponentBottom = ({
    mode,
    activeIcon,
    setActiveIcon,
    handleClimate,
    handleMusic,
    navigateToWorkshop,
    handleNavigateToSnapShot,
    handleMusicChange,
}) => {
    const styles = mode === 'workshop' ? workshopStyles : gameStyles;
    const config = getBottomToolbarConfig(mode);

    const handleIconClick = (type) => {
        if (mode === 'game') {
            if (type === 'hammer') {
                handleMusicChange(0);
                navigateToWorkshop();
            }
            if (type === 'camera') {
                handleMusicChange(0);
                handleNavigateToSnapShot();
            }
            if (type === 'climate') {
                handleClimate();
            }
            if (type === 'music') {
                handleMusic();
            }
        } else if (type === 'sweep') {
            console.log('Sweep');
        }
        setActiveIcon((prevActiveIcon) => (prevActiveIcon === type ? null : type));
    };

    const renderButton = (button) => (
        <div key={button.type} className={styles[button.className]}>
            <BottomIconComponent
                passiveIcon={button.passive}
                activeIcon={button.active}
                isActive={activeIcon === button.type}
                type={button.type}
                onClick={() => handleIconClick(button.type)}
            />
        </div>
    );

    return (
        <div className={styles.componentBottom}>
            {config.leftButtons.map(renderButton)}
            <div className={styles.middleDiv}>
                <Ball mode={mode} />
            </div>
            {config.rightButtons && config.rightButtons.map(renderButton)}
            <div className={styles.bottomRightCorner}>
                <HelpComponent
                    placeholderImage={config.images.placeholderImage}
                    frames={config.images.frames}
                />
            </div>
        </div>
    );
};

export default ComponentBottom;