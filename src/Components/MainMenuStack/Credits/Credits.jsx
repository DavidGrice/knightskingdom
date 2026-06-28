import React from 'react';
import styles from './Credits.module.css';
import { BackCheckmarkButton, MenuScreenLayout } from '../../Common';
import creditsBackground from './CreditsResourceStack/main_image.png';

const Credits = ({ navigateToMenu }) => (
  <MenuScreenLayout
    backgroundImage={creditsBackground}
    bottomLeft={<BackCheckmarkButton onClick={navigateToMenu} />}
  >
    <div className={styles.textScrollDiv}>
      <div className={styles.textScroll}>
        <h1>Credits</h1>
        <br />
        <h2>Developers</h2>
        <br />
        <p>David Grice</p>
        <br />
        <h2>Special Thanks</h2>
        <br />
        <h3>Asset Extraction</h3>
        <br />
        <p>Aluigi</p>
        <br />
        <h3>Discord Helpers</h3>
        <br />
        <p>ZDev</p>
        <p>tjoener</p>
        <p>RED_EYE</p>
        <p>Mr.Mouse</p>
        <p>RichWhitehouse</p>
        <p>Lofty</p>
        <p>blackninja</p>
        <p>Evil Commander</p>
        <br />
        <h3>Original Creators</h3>
        <br />
        <p>Rich Hill</p>
        <p>Paul Grimster</p>
        <br />
      </div>
    </div>
  </MenuScreenLayout>
);

export default Credits;