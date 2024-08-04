import React, { useState } from 'react';
import styles from './BucketBottom.module.css';
import { images, buildingsData, challengesData, explosivesData, minifigureAnimalsData, sceneryData, vehiclesData } from './BucketBottomResourceStack/index';

const BucketBottom = ({ activeBucket }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(images.DownArrow2);
    const [upArrowImage, setUpArrowImage] = useState(images.UpArrow2);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const setActiveTab = (activeTab) => {
        switch (activeTab) {
            case 0:
                return buildingsData;
            case 1:
                return challengesData;
            case 2:
                return explosivesData;
            case 3:
                return minifigureAnimalsData;
            case 4:
                return sceneryData;
            case 5:
                return vehiclesData;
            default:
                return buildingsData;
        }
    }
    const items = setActiveTab(activeBucket);
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