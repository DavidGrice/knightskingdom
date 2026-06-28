import React from 'react';
import styles from './MainMenu.module.css';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { CommonComponent, MenuScreenLayout } from '../../Common';
import castleBackground from './MainMenuResources/castle.png';
import Start2 from './MainMenuResources/start_2.png';
import Start4 from './MainMenuResources/start_4.png';
import ChangePlayer2 from './MainMenuResources/change_player_2.png';
import ChangePlayer4 from './MainMenuResources/change_player_4.png';
import Options2 from './MainMenuResources/options_2.png';
import Options4 from './MainMenuResources/options_4.png';
import Credits2 from './MainMenuResources/credits_2.png';
import Credits4 from './MainMenuResources/credits_4.png';
import Quit2 from './MainMenuResources/quit_2.png';
import Quit4 from './MainMenuResources/quit_4.png';

const MainMenu = ({ navigateToAuthentication, selectedProfile, navigateToStart }) => {
  const router = useRouter();

  return (
    <MenuScreenLayout backgroundImage={castleBackground} contentClassName={styles.centeredContainer}>
      <div>
        {selectedProfile && <h1>Welcome, {selectedProfile.name}!</h1>}
      </div>
      <div className={styles.divSeparators}>
        <CommonComponent initialImage={Start2} hoverImage={Start4} altText="Start" onClick={navigateToStart} />
      </div>
      <div className={styles.divSeparators}>
        <CommonComponent
          initialImage={ChangePlayer2}
          hoverImage={ChangePlayer4}
          altText="Change Player"
          onClick={navigateToAuthentication}
        />
      </div>
      <div className={styles.divSeparators}>
        <CommonComponent
          initialImage={Options2}
          hoverImage={Options4}
          altText="Options"
          onClick={() => router.push(ROUTES.options)}
        />
      </div>
      <div className={styles.divSeparators}>
        <CommonComponent
          initialImage={Credits2}
          hoverImage={Credits4}
          altText="Credits"
          onClick={() => router.push(ROUTES.credits)}
        />
      </div>
      <div className={styles.divSeparators}>
        <CommonComponent
          initialImage={Quit2}
          hoverImage={Quit4}
          altText="Quit"
          onClick={navigateToAuthentication}
        />
      </div>
    </MenuScreenLayout>
  );
};

export default MainMenu;