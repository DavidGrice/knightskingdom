import React, { useState } from 'react';
import styles from './Authentication.module.css';
import { ProfileContainer } from '..';
import { CommonComponent } from '../../Common';
import Trashcan2 from '../AuthStackResources/trashcan_2.png';
import Trashcan4 from '../AuthStackResources/trashcan_4.png';
import Checkmark2 from '../AuthStackResources/checkmark_2.png';
import Checkmark4 from '../AuthStackResources/checkmark_4.png';

const Authentication = ({ userData, updateUserData, navigateToMainMenu }) => {
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [isPopulated, setIsPopulated] = useState(null);

    const handleProfileSelect = (profile) => {
        console.log('Selected profile:', profile);
        setSelectedProfile(profile);
    };

    const handleCheckmarkClick = () => {
        if (selectedProfile) {
            console.log('Selected profile:', selectedProfile);
            navigateToMainMenu(selectedProfile);
        } else {
            alert('Please select a profile first.');
        }
    };

    return (
        <div className={styles.backgroundImage}>
            <div className={styles.centeredContainer}>
                {userData.length < 5 && (
                    <ProfileContainer 
                        key="empty-input" 
                        name=""
                        level="page" // Set the default level 
                        isPopulated={false}
                        onClick={() => {}} 
                        isSelected={false}
                        setSelectedProfile={setSelectedProfile} // Pass setSelected
                        handleProfileSelect={handleProfileSelect} // Pass handleProfileSelect
                        setIsPopulated={setIsPopulated} // Pass setIsPopulated
                    />
                )}
                {userData.map((profile, index) => (
                    <ProfileContainer 
                        key={index} 
                        name={profile.name}
                        level={profile.level} // Pass the level prop
                        isPopulated={profile.isPopulated} 
                        onClick={() => handleProfileSelect(profile)} // Add onClick handler
                        isSelected={selectedProfile && selectedProfile.name === profile.name} // Highlight selected profile
                    />
                ))}
            </div>
            <div className={styles.bottomRightCorner}>
                <CommonComponent initialImage={Trashcan2} hoverImage={Trashcan4} altText="Trashcan" />
            </div>
            <div className={styles.bottomLeftCorner}>
                <CommonComponent 
                    initialImage={Checkmark2} 
                    hoverImage={Checkmark4} 
                    altText="Checkmark" 
                    onClick={handleCheckmarkClick} // Add onClick handler
                />
            </div>
        </div>
    );
};
    
    export default Authentication;