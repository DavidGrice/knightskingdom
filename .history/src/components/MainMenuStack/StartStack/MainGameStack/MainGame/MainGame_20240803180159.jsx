import React, { useEffect, useRef, useState } from 'react';
import styles from './MainGame.module.css';
import { GameEngine, ComponentTop, ComponentBottom } from './index';


const MainGame = ({ navigateToStartMenu, map }) => {
  

  return (
    <div>
      <div className={styles.topComponent}>
        <ComponentTop navigateToStartMenu={navigateToStartMenu} />
      </div>
      <GameEngine map={map} />
      <div className={styles.topComponent}>
        <ComponentBottom />
      </div>
    </div>
  );
}

export default MainGame;