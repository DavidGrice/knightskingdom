import React, { useState } from 'react';
import styles from './Music.module.css';
import { images, checkMarkImages } from './MusicResourceStack/index';

const Music = () => {
    return (
        <div className={styles.musicDiv}>
            {images.map((image, index) => (
                <img key={index} src={image.passive} alt="icon" />
            ))}
        </div>
    );
}

export default Music;