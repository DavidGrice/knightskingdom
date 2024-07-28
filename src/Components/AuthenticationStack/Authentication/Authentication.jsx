import React, { useState } from 'react';
import styles from './Authentication.module.css';
import { CommonComponent, ProfileContainer } from '..';
import Trashcan1 from '../AuthStackResources/trashcan_1.png';
import Trashcan4 from '../AuthStackResources/trashcan_4.png';
import Checkmark1 from '../AuthStackResources/checkmark_1.png';
import Checkmark4 from '../AuthStackResources/checkmark_4.png';

const Authentication = ({ userData, navigateToNextScreen }) => {
    const [selectedProfile, setSelectedProfile] = useState(null);

    const handleProfileSelect = (profile) => {
        console.log('Selected profile:', profile);
        setSelectedProfile(profile);
    };

    const handleCheckmarkClick = () => {
        if (selectedProfile) {
            console.log('Selected profile:', selectedProfile);
            // navigateToNextScreen(selectedProfile);
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
                <CommonComponent initialImage={Trashcan1} hoverImage={Trashcan4} altText="Trashcan" />
            </div>
            <div className={styles.bottomLeftCorner}>
                <CommonComponent 
                    initialImage={Checkmark1} 
                    hoverImage={Checkmark4} 
                    altText="Checkmark" 
                    onClick={handleCheckmarkClick} // Add onClick handler
                />
            </div>
        </div>
    );
};
    
    export default Authentication;