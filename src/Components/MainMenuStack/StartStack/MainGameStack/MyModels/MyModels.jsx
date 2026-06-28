import React from 'react';
import styles from './MyModels.module.css';
import MyModelsHolder from './MyModelsHolder/MyModelsHolder';
import { CommonComponent } from '../../../../Common';
import { myModelsData } from './MyModelsResourceStack';

const MyModels = ({ selectedProfile, onDeleteSavedWorld, navigateBackToGame }) => {
  const handleCheckmarkClick = () => {
    navigateBackToGame();
  };

  return (
    <div className={styles.myModelsDiv}>
      <MyModelsHolder
        selectedProfile={selectedProfile}
        onDeleteSavedWorld={onDeleteSavedWorld}
      />
      <div className={styles.bottomLeftCorner}>
        <CommonComponent
          initialImage={myModelsData.checkmarks.passive}
          hoverImage={myModelsData.checkmarks.active}
          altText="Checkmark"
          onClick={handleCheckmarkClick}
        />
      </div>
    </div>
  );
};

export default MyModels;