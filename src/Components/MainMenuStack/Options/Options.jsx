import React from "react";
import styles from './Options.module.css'
import { HelpComponent } from "../../Common";

import BubbleDisabled2 from './OptionsResourceStack/bubble_disable_2.png';
import BubbleDisabled4 from './OptionsResourceStack/bubble_disable_4.png';
import BubbleEnabled2 from './OptionsResourceStack/bubble_enable_2.png';
import BubbleEnabled4 from './OptionsResourceStack/bubble_enable_4.png';
import CheckMark2 from './OptionsResourceStack/checkmark_2.png';
import CheckMark4 from './OptionsResourceStack/checkmark_4.png';
import DarkHelp2 from './OptionsResourceStack/dark_help_2.png';
import HardwareEnabled2 from './OptionsResourceStack/hardware_enable_2.png';
import HardwareEnabled4 from './OptionsResourceStack/hardware_enable_4.png';
import HighLevelBrick2 from './OptionsResourceStack/high_level_brick_2.png';
import HighLevelBrick4 from './OptionsResourceStack/high_level_brick_4.png';
import LowLevelBrick2 from './OptionsResourceStack/low_level_brick_2.png';
import LowLevelBrick4 from './OptionsResourceStack/low_level_brick_4.png';
import MediumLevelBrick2 from './OptionsResourceStack/medium_level_brick_2.png';
import MediumLevelBrick4 from './OptionsResourceStack/medium_level_brick_4.png';
import MusicEnabled2 from './OptionsResourceStack/music_enable_2.png';
import MusicEnabled4 from './OptionsResourceStack/music_enable_4.png';
import OvalTrans1 from './OptionsResourceStack/oval_trans_1.png';
import OvalTrans2 from './OptionsResourceStack/oval_trans_2.png';
import OvalTrans3 from './OptionsResourceStack/oval_trans_3.png';
import OvalTrans4 from './OptionsResourceStack/oval_trans_4.png';
import RichardPlaceholder from './OptionsResourceStack/richard_placeholder.png';
import SoftwareRender2 from './OptionsResourceStack/software_render_2.png';
import SoftwareRender4 from './OptionsResourceStack/software_render_4.png';

const Options = () => {

    return (
        <div className={styles.backgroundImage}>
            <HelpComponent placeholderImage={RichardPlaceholder} spriteSheetImage={DarkHelp2} />
        </div>
    );

}

export default Options;