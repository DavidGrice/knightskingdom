import React from 'react';
import styles from './MyModelsHolder.module.css';
import MyModelsBody from '../MyModelsBody/MyModelsBody';

const MyModelsHolder = ({ selectedProfile, onDeleteSavedWorld }) => (
  <div className={styles.componentHolder}>
    <MyModelsBody
      selectedProfile={selectedProfile}
      onDeleteSavedWorld={onDeleteSavedWorld}
    />
  </div>
);

export default MyModelsHolder;