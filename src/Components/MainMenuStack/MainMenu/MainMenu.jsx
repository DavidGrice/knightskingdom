import React from "react";
import styles from "./MainMenu.module.css";
import { useNavigate } from 'react-router-dom';
import { CommonComponent } from "../../Common";
import Start2 from './MainMenuResources/start_2.png'
import Start4 from './MainMenuResources/start_4.png'
import ChangePlayer2 from './MainMenuResources/change_player_2.png'
import ChangePlayer4 from './MainMenuResources/change_player_4.png'
import Options2 from './MainMenuResources/options_2.png'
import Options4 from './MainMenuResources/options_4.png'
import Credits2 from './MainMenuResources/credits_2.png'
import Credits4 from './MainMenuResources/credits_4.png'
import Quit2 from './MainMenuResources/quit_2.png'
import Quit4 from './MainMenuResources/quit_4.png'


const MainMenu = ( { navigateToAuthentication, selectedProfile } ) => {
    const navigate = useNavigate();

    const handleChangePlayerClick = () => {
        navigateToAuthentication();
      };

    const handleQuitClick = () => {
        navigateToAuthentication();
    };

    const handleOptionsClick = () => {
        navigate('/options'); // Replace '/options' with the actual path to your Options component
    };
    
    return (
        <div className={styles.backgroundImage}>
            <div className={styles.centeredContainer}>
                <div>
                    {selectedProfile && (
                        <h1>Welcome, {selectedProfile.name}!</h1>
                    )}
                </div>
                <div className={styles.divSeparators}>
                    <CommonComponent initialImage={Start2} hoverImage={Start4} altText="Start" />
                </div>
                <div className={styles.divSeparators}>
                    <CommonComponent initialImage={ChangePlayer2} hoverImage={ChangePlayer4} altText="Change Player" onClick={handleChangePlayerClick} />
                </div>
                <div className={styles.divSeparators}>
                    <CommonComponent initialImage={Options2} hoverImage={Options4} altText="Options" onClick={handleOptionsClick} />
                </div>
                <div className={styles.divSeparators}>
                    <CommonComponent initialImage={Credits2} hoverImage={Credits4} altText="Credits" />
                </div>
                <div className={styles.divSeparators}>
                    <CommonComponent initialImage={Quit2} hoverImage={Quit4} altText="Quit" onClick={handleQuitClick} />
                </div>
            </div>
        </div>
    );
}

export default MainMenu;