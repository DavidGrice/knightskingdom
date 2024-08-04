import React, { useEffect, useRef, useState } from 'react';
import styles from './MainGame.module.css';
import { GameEngine, ComponentTop, ComponentBottom } from './index';


const MainGame = ({ navigateToStartMenu, map }) => {
  const [showBucket, setShowBucket] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  

  return (
    <div className={styles.mainDiv}>
      <div className={styles.topComponent}>
        <ComponentTop navigateToStartMenu={navigateToStartMenu} 
        setShowBucket={setShowBucket}
        />
      </div>
      {
      showBucket && (<div className={styles.leftComponent}>
        <Bucket />
      </div>)
      }
      
      <GameEngine map={map} />
      <div className={styles.bottomComponent}>
        <ComponentBottom />
      </div>
    </div>
  );
}

export default MainGame;