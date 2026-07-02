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
    onSweep,
}) => {
    const styles = mode === 'workshop' ? workshopStyles : gameStyles;
    const config = getBottomToolbarConfig(mode);

    const handleIconClick = (type) => {
        const isToggleOff = activeIcon === type;

        if (mode === 'game') {
            switch (type) {
                case 'hammer':
                    if (!isToggleOff) {
                        handleMusicChange(0);
                        navigateToWorkshop();
                    }
                    break;
                case 'camera':
                    if (!isToggleOff) {
                        handleMusicChange(0);
                        handleNavigateToSnapShot();
                    }
                    break;
                case 'climate':
                    handleClimate();
                    break;
                case 'music':
                    handleMusic();
                    break;
                default:
                    break;
            }
        } else if (type === 'sweep' && !isToggleOff) {
            onSweep?.();
        }

        setActiveIcon(isToggleOff ? null : type);
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