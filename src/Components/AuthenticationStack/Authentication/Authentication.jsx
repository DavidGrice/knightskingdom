import React, { useState, useEffect } from 'react';
import styles from './Authentication.module.css';
import { ProfileContainer } from '..';
import { CommonComponent } from '../../Common';
import Trashcan2 from '../AuthStackResources/trashcan_2.png';
import Trashcan4 from '../AuthStackResources/trashcan_4.png';
import Checkmark2 from '../AuthStackResources/checkmark_2.png';
import Checkmark4 from '../AuthStackResources/checkmark_4.png';

const Authentication = ({ userData, navigateToMainMenu }) => {
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [newData, setNewData] = useState(userData);
    const [isNewProfile, setIsNewProfile] = useState(false);
    const [showEnterNameImage, setShowEnterNameImage] = useState(false);

    useEffect(() => {
        if (userData) {
          setNewData(userData);
        } else {
          setNewData([]);
        }
      }, [userData]);

    const handleProfileSelect = (profile) => {
        console.log('Selected profile:', profile);
        setSelectedProfile(profile);
        setShowEnterNameImage(false);
    };

    const handleCheckmarkClick = () => {
        if (selectedProfile) {
            console.log('Selected profile:', selectedProfile);
            navigateToMainMenu(selectedProfile);
        } else {
            alert('Please select a profile first.');
        }
    };

    const handleTrashcanClick = () => {
        if (selectedProfile) {
            console.log('Deleting profile:', selectedProfile);
            const updatedData = newData.filter(profile => profile.name !== selectedProfile.name);
            setNewData(updatedData);
            setSelectedProfile(null);
        } else {
            alert('Please select a profile first.');
        }
    }

    return (
        <div className={styles.backgroundImage}>
            <div className={styles.centeredContainer}>
                {newData.length < 5 && (
                    <ProfileContainer 
                        key="empty-input" 
                        name=""
                        level="page" // Set the default level 
                        onClick={() => {setSelectedProfile(null)}}
                        isNewProfile={true} // Set isNewProfile to true
                        setIsNewProfile={setIsNewProfile} // Pass setIsNewProfile
                        isSelected={false}
                        setSelectedProfile={setSelectedProfile} // Pass setSelected
                        handleProfileSelect={handleProfileSelect} // Pass handleProfileSelect
                        newData={newData} // Pass newData
                        setNewData={setNewData} // Pass setNewData
                        setShowEnterNameImage={setShowEnterNameImage}
                        showEnterNameImage={showEnterNameImage}
                    />
                )}
                {newData.map((profile, index) => (
                    <ProfileContainer 
                        key={index} 
                        name={profile.name}
                        level={profile.level} // Pass the level prop
                        onClick={() => handleProfileSelect(profile)} // Add onClick handler
                        isNewProfile={isNewProfile} // Pass isNewProfile
                        isSelected={selectedProfile && selectedProfile.name === profile.name} // Highlight selected profile
                    />
                ))}
            </div>
            <div className={styles.bottomRightCorner}>
                <CommonComponent 
                    initialImage={Trashcan2}
                    hoverImage={Trashcan4}
                    altText="Trashcan"
                    onClick={handleTrashcanClick}
                />
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