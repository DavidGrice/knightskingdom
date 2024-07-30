import React from "react";
import styles from './Options.module.css'
import { CommonComponent, HelpComponent } from "../../Common";
import BubbleDisabled2 from './OptionsResourceStack/bubble_disable_2.png';
import BubbleDisabled4 from './OptionsResourceStack/bubble_disable_4.png';
import BubbleEnabled2 from './OptionsResourceStack/bubble_enable_2.png';
import BubbleEnabled4 from './OptionsResourceStack/bubble_enable_4.png';
import Checkmark2 from './OptionsResourceStack/checkmark_2.png';
import Checkmark4 from './OptionsResourceStack/checkmark_4.png';
import DarkHelp2 from './OptionsResourceStack/OptionsFrames/dark_help_2.png';
import HardwareEnabled2 from './OptionsResourceStack/hardware_enable_2.png';
import HardwareEnabled4 from './OptionsResourceStack/hardware_enable_4.png';
import HighLevelBrick2 from './OptionsResourceStack/high_level_brick_2.png';
import HighLevelBrick4 from './OptionsResourceStack/high_level_brick_4.png';
import LowLevelBrick2 from './OptionsResourceStack/low_level_brick_2.png';
import LowLevelBrick4 from './OptionsResourceStack/low_level_brick_4.png';
import MediumLevelBrick2 from './OptionsResourceStack/medium_level_brick_2.png';
import MediumLevelBrick4 from './OptionsResourceStack/medium_level_brick_4.png';
import MusicDisabled2 from './OptionsResourceStack/music_disable_2.png';
import MusicDisabled4 from './OptionsResourceStack/music_disable_4.png';
import MusicEnabled2 from './OptionsResourceStack/music_enable_2.png';
import MusicEnabled4 from './OptionsResourceStack/music_enable_4.png';
import OvalTrans1 from './OptionsResourceStack/oval_trans_1.png';
import OvalTrans2 from './OptionsResourceStack/oval_trans_2.png';
import OvalTrans3 from './OptionsResourceStack/oval_trans_3.png';
import OvalTrans4 from './OptionsResourceStack/oval_trans_4.png';
import RichardPlaceholder from './OptionsResourceStack/richard_placeholder.png';
import SoftwareRender2 from './OptionsResourceStack/software_render_2.png';
import SoftwareRender4 from './OptionsResourceStack/software_render_4.png';
import frames, { OptionsMenuPlaceholder } from './index';


const Options = ( { navigateToMenu } ) => {
    
    const handleCheckmarkClick = () => {
        navigateToMenu();
    }

    return (
        <div className={styles.backgroundImage}>
            <div className={styles.centeredContainer}>
                <div className={styles.divSeparators}>
                    <OptionsMenuPlaceholder
                        isTop={true}
                        ring={OvalTrans1}
                        leftImageDark={LowLevelBrick2}
                        leftImageLight={LowLevelBrick4}
                        middleImageDark={MediumLevelBrick2}
                        middleImageLight={MediumLevelBrick4}
                        rightImageDark={HighLevelBrick2}
                        rightImageLight={HighLevelBrick4}
                        />
                </div>
                <div className={styles.divSeparators}>
                    <OptionsMenuPlaceholder
                        isTop={false}
                        ring={OvalTrans2}
                        leftImageDark={SoftwareRender2}
                        leftImageLight={SoftwareRender4}
                        rightImageDark={HardwareEnabled2}
                        rightImageLight={HardwareEnabled4}
                        />
                </div>
                <div className={styles.divSeparators}>
                    <OptionsMenuPlaceholder
                        isTop={false}
                        ring={OvalTrans3}
                        leftImageDark={BubbleEnabled2}
                        leftImageLight={BubbleEnabled4}
                        rightImageDark={BubbleDisabled2}
                        rightImageLight={BubbleDisabled4}
                        />
                </div>
                <div className={styles.divSeparators}>
                    <OptionsMenuPlaceholder
                        isTop={false}
                        ring={OvalTrans4}
                        leftImageDark={MusicEnabled2}
                        leftImageLight={MusicEnabled4}
                        rightImageDark={MusicDisabled2}
                        rightImageLight={MusicDisabled4}
                        />
                </div>
            </div>
            <div className={styles.bottomRightCorner}>
                <HelpComponent backgroundImage={RichardPlaceholder} placeholderImage={DarkHelp2} frames={frames} />
            </div>
            <div className={styles.bottomLeftCorner}>
                <CommonComponent 
                    initialImage={Checkmark2} 
                    hoverImage={Checkmark4} 
                    altText="Checkmark" 
                    onClick={handleCheckmarkClick} // Add onClick handler
                />
            </div>
        </div>
    );

}

export default Options;