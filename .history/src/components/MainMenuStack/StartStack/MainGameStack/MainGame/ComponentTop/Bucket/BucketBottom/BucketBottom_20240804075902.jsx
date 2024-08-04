import React, { useState } from 'react';
import styles from './BucketBottom.module.css';
import images from './BucketBottomResourceStack/index';

const BucketBottom = ({ modelData }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(localWorldTheme.downArrowSolid);
    const [upArrowImage, setUpArrowImage] = useState(localWorldTheme.upArrowSolid);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const items = isLocalWorlds ? localWorldsData : sharedWorldsData;
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