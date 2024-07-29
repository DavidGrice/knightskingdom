import React from "react";
import styles from './HelpComponentSVG.module.css'; // Import the CSS file for styling
import DarkHelp1 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_1.png';
import DarkHelp2 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_2.png';
import DarkHelp3 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_3.png';
import DarkHelp4 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_4.png';
import DarkHelp5 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_5.png';
import DarkHelp6 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_6.png';
import DarkHelp7 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_7.png';
import DarkHelp8 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_8.png';
import DarkHelp9 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_9.png';
import DarkHelp10 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_10.png';
import DarkHelp11 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_11.png';
import DarkHelp12 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_12.png';
import DarkHelp13 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_13.png';
import DarkHelp14 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_14.png';
import DarkHelp15 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_15.png';
import DarkHelp16 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_16.png';
import DarkHelp17 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_17.png';
import DarkHelp18 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_18.png';
import DarkHelp19 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_19.png';
import DarkHelp20 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_20.png';
import DarkHelp21 from '../../../MainMenuStack/Options/OptionsResourceStack/dark_help_21.png';

const HelpComponentSVG = () => {

    const handleMouseOver = (e) => {
        e.currentTarget.style.animationPlayState = 'running';
    };

    const handleMouseOut = (e) => {
        e.currentTarget.style.animationPlayState = 'paused';
    };


    return (
        <div className={styles.helpComponent}>
            <svg width="120" height="103" xmlns="http://www.w3.org/2000/svg">
                <image id="frame1" href={DarkHelp1} width="120" height="103" visibility="visible"/>
                <image id="frame2" href={DarkHelp2} width="120" height="103" visibility="hidden"/>
                <image id="frame3" href={DarkHelp3} width="120" height="103" visibility="hidden"/>
                <image id="frame4" href={DarkHelp4} width="120" height="103" visibility="hidden"/>
                <image id="frame5" href={DarkHelp5} width="120" height="103" visibility="hidden"/>
                <image id="frame6" href={DarkHelp6} width="120" height="103" visibility="hidden"/>
                <image id="frame7" href={DarkHelp7} width="120" height="103" visibility="hidden"/>
                <image id="frame8" href={DarkHelp8} width="120" height="103" visibility="hidden"/>
                <image id="frame9" href={DarkHelp9} width="120" height="103" visibility="hidden"/>
                <image id="frame10" href={DarkHelp10} width="120" height="103" visibility="hidden"/>
                <image id="frame11" href={DarkHelp11} width="120" height="103" visibility="hidden"/>
                <image id="frame12" href={DarkHelp12} width="120" height="103" visibility="hidden"/>
                <image id="frame13" href={DarkHelp13} width="120" height="103" visibility="hidden"/>
                <image id="frame14" href={DarkHelp14} width="120" height="103" visibility="hidden"/>
                <image id="frame15" href={DarkHelp15} width="120" height="103" visibility="hidden"/>
                <image id="frame16" href={DarkHelp16} width="120" height="103" visibility="hidden"/>
                <image id="frame17" href={DarkHelp17} width="120" height="103" visibility="hidden"/>
                <image id="frame18" href={DarkHelp18} width="120" height="103" visibility="hidden"/>
                <image id="frame19" href={DarkHelp19} width="120" height="103" visibility="hidden"/>
                <image id="frame20" href={DarkHelp20} width="120" height="103" visibility="hidden"/>
                <image id="frame21" href={DarkHelp21} width="120" height="103" visibility="hidden"/>
            </svg>
        </div>
    );
}

export default HelpComponentSVG;