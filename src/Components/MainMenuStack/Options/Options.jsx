import React from 'react';
import styles from './Options.module.css';
import { BackCheckmarkButton, HelpComponent, MenuScreenLayout } from '../../Common';
import { defaultProfileOptions } from '../../../api';
import BubbleDisabled2 from './OptionsResourceStack/bubble_disable_2.png';
import BubbleDisabled4 from './OptionsResourceStack/bubble_disable_4.png';
import BubbleEnabled2 from './OptionsResourceStack/bubble_enable_2.png';
import BubbleEnabled4 from './OptionsResourceStack/bubble_enable_4.png';
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
import castleBackground from '../MainMenu/MainMenuResources/castle.png';
import frames, { OptionsMenuPlaceholder } from './index';

const brickQualityToSide = { low: 'left', medium: 'middle', high: 'right' };
const sideToBrickQuality = { left: 'low', middle: 'medium', right: 'high' };
const rendererToSide = { software: 'left', hardware: 'right' };
const sideToRenderer = { left: 'software', right: 'hardware' };
const toggleToSide = { on: 'left', off: 'right' };
const sideToToggle = { left: 'on', right: 'off' };

const Options = ({ navigateToMenu, selectedProfile, onUpdateOptions }) => {
  const options = { ...defaultProfileOptions, ...(selectedProfile?.options || {}) };

  return (
    <MenuScreenLayout
      screenKey="OPTIONS"
      backgroundImage={castleBackground}
      contentClassName={styles.centeredContainer}
      bottomLeft={<BackCheckmarkButton onClick={navigateToMenu} />}
      bottomRight={
        <HelpComponent
          backgroundImage={RichardPlaceholder}
          placeholderImage={DarkHelp2}
          frames={frames}
          wrapperClassName={styles.optionsHelpBin}
          frameClassName={styles.optionsHelpFrame}
        />
      }
    >
      <div className={styles.optionRow}>
        <OptionsMenuPlaceholder
          isTop={true}
          ring={OvalTrans1}
          leftImageDark={LowLevelBrick2}
          leftImageLight={LowLevelBrick4}
          middleImageDark={MediumLevelBrick2}
          middleImageLight={MediumLevelBrick4}
          rightImageDark={HighLevelBrick2}
          rightImageLight={HighLevelBrick4}
          activeSide={brickQualityToSide[options.brickQuality] || 'middle'}
          onSelect={(side) => onUpdateOptions?.({ brickQuality: sideToBrickQuality[side] })}
        />
      </div>
      <div className={styles.optionRow}>
        <OptionsMenuPlaceholder
          isTop={false}
          ring={OvalTrans2}
          leftImageDark={SoftwareRender2}
          leftImageLight={SoftwareRender4}
          rightImageDark={HardwareEnabled2}
          rightImageLight={HardwareEnabled4}
          activeSide={rendererToSide[options.renderer] || 'right'}
          onSelect={(side) => onUpdateOptions?.({ renderer: sideToRenderer[side] })}
        />
      </div>
      <div className={styles.optionRow}>
        <OptionsMenuPlaceholder
          isTop={false}
          ring={OvalTrans3}
          leftImageDark={BubbleEnabled2}
          leftImageLight={BubbleEnabled4}
          rightImageDark={BubbleDisabled2}
          rightImageLight={BubbleDisabled4}
          activeSide={toggleToSide[options.dialogue] || 'left'}
          onSelect={(side) => onUpdateOptions?.({ dialogue: sideToToggle[side] })}
        />
      </div>
      <div className={styles.optionRow}>
        <OptionsMenuPlaceholder
          isTop={false}
          ring={OvalTrans4}
          leftImageDark={MusicEnabled2}
          leftImageLight={MusicEnabled4}
          rightImageDark={MusicDisabled2}
          rightImageLight={MusicDisabled4}
          activeSide={toggleToSide[options.music] || 'left'}
          onSelect={(side) => onUpdateOptions?.({ music: sideToToggle[side] })}
        />
      </div>
    </MenuScreenLayout>
  );
};

export default Options;