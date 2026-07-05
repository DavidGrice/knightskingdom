'use client';

import React, { useEffect, useRef } from 'react';
import styles from './Credits.module.css';
import { BackCheckmarkButton, MenuScreenLayout } from '../../Common';
import { CREDITS_SCROLL_PX_PER_SEC } from '../../Common/MenuStageLayout/creditsLayoutMath';
import creditsBackground from './CreditsResourceStack/main_image.png';

const CreditsBody = () => (
  <>
    <h1 className={styles.creditsTitle}>Credits</h1>
    <h2 className={styles.creditsSection}>Developers</h2>
    <p className={styles.creditsName}>David Grice</p>
    <h2 className={styles.creditsSection}>Special Thanks</h2>
    <h3 className={styles.creditsSubsection}>Asset Extraction</h3>
    <p className={styles.creditsName}>Aluigi</p>
    <h3 className={styles.creditsSubsection}>Discord Helpers</h3>
    <p className={styles.creditsName}>ZDev</p>
    <p className={styles.creditsName}>tjoener</p>
    <p className={styles.creditsName}>RED_EYE</p>
    <p className={styles.creditsName}>Mr.Mouse</p>
    <p className={styles.creditsName}>RichWhitehouse</p>
    <p className={styles.creditsName}>Lofty</p>
    <p className={styles.creditsName}>blackninja</p>
    <p className={styles.creditsName}>Evil Commander</p>
    <h3 className={styles.creditsSubsection}>Original Creators</h3>
    <p className={styles.creditsName}>Rich Hill</p>
    <p className={styles.creditsName}>Paul Grimster</p>
  </>
);

const Credits = ({ navigateToMenu }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) {
      return undefined;
    }

    const syncDuration = () => {
      const loopUnit = scrollEl.scrollHeight / 2;
      if (loopUnit <= 0) {
        return;
      }
      const durationSec = Math.max(18, loopUnit / CREDITS_SCROLL_PX_PER_SEC);
      scrollEl.style.setProperty('--credits-scroll-duration', `${durationSec.toFixed(2)}s`);
    };

    syncDuration();
    const observer = new ResizeObserver(syncDuration);
    observer.observe(scrollEl);
    return () => observer.disconnect();
  }, []);

  return (
    <MenuScreenLayout
      screenKey="CREDITS"
      backgroundImage={creditsBackground}
      bottomLeft={<BackCheckmarkButton onClick={navigateToMenu} />}
    >
      <div className={styles.creditsScene}>
        <div className={styles.textScrollDiv} data-testid="credits-scroll-panel">
          <div className={styles.textScroll} ref={scrollRef}>
            <div className={styles.textScrollTrack} data-credits-track>
              <CreditsBody />
            </div>
            <div className={styles.textScrollTrack} aria-hidden="true">
              <CreditsBody />
            </div>
          </div>
        </div>
      </div>
    </MenuScreenLayout>
  );
};

export default Credits;