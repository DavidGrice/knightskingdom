import React from 'react';
import styles from './Authentication.module.css';
// import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ProfileIcon, CommonComponent } from '..';
import Page from '../AuthStackResources/page_1.png';
import Trashcan1 from '../AuthStackResources/trashcan_1.png';
import Trashcan4 from '../AuthStackResources/trashcan_4.png';
import Checkmark1 from '../AuthStackResources/checkmark_1.png';
import Checkmark4 from '../AuthStackResources/checkmark_4.png';

const Authentication = () => {
    return (
        <div className={styles.backgroundImage}>
            <div className={styles.centeredContainer}>
                <ProfileIcon initialImage={Page} initialText="Input Name Here!" />
            </div>
            <div className={styles.bottomRightCorner}>
                <CommonComponent initialImage={Trashcan1} hoverImage={Trashcan4} altText="Trashcan" />
            </div>
            <div className={styles.bottomLeftCorner}>
                <CommonComponent initialImage={Checkmark1} hoverImage={Checkmark4} altText="Checkmark" />
            </div>
        </div>
    );
};

export default Authentication;