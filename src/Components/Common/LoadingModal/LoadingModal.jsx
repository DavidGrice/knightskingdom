import React from 'react';
import { createPortal } from 'react-dom';
import LoadingComponent from '../LoadingComponent/LoadingComponent';
import styles from './LoadingModal.module.css';

const LoadingModal = ({ visible }) => {
  if (!visible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      aria-hidden="true"
    >
      <div className={styles.modal}>
        <LoadingComponent isLoading />
      </div>
    </div>,
    document.body,
  );
};

export default LoadingModal;