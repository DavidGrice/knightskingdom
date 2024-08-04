import React, { useState } from 'react';
import styles from './BucketBottom.module.css';
import { images, buildingsData, challengesData, explosivesData, minifigureAnimalsData, sceneryData, vehiclesData } from './BucketBottomResourceStack/index';

const BucketBottom = ({ activeTab }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(images.DownArrow2);
    const [upArrowImage, setUpArrowImage] = useState(images.UpArrow2);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const items = modelData;
    const itemsPerPage = 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    return (
        <div className={styles.bucketBottom}>
            <div className={styles.upArrow}>
                <img src='assets/images/up-arrow.png' alt='up-arrow' />
            </div>
        </div>
    );
}

export default BucketBottom;