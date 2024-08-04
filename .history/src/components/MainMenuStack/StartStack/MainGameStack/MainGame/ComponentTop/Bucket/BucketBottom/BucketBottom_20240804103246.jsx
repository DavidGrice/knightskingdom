import React, { useState, useEffect } from 'react';
import styles from './BucketBottom.module.css';
import { images, buildingsData, challengesData, explosivesData, minifigureAnimalsData, sceneryData, vehiclesData } from './BucketBottomResourceStack/index';
import selectedImage from './BucketBottomResourceStack/wh_selection.png';

const BucketBottom = ({ activeBucket, didUpdate, setDidUpdate }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(images.downArrowSolid);
    const [upArrowImage, setUpArrowImage] = useState(images.upArrowSolid);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const setActiveTab = (activeTab) => {
        switch (activeTab) {
            case 0:
                return minifigureAnimalsData;
            case 1:
                return buildingsData;
            case 2:
                return vehiclesData;
            case 3:
                return sceneryData;
            case 4:
                return explosivesData;
            case 5:
                return challengesData;
            default:
                return minifigureAnimalsData;
        }
    }
    const items = setActiveTab(activeBucket);
    const itemsPerPage = 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);
    console.log('items', items);

    useEffect(() => {
        setBucket();
    }, [currentPage, items, setBucket]);

    const setBucket = () => {
        if (didUpdate) {
            setCurrentPage(1);
            setDisplayedItems([]);
            setSelectedItem(null);
            setDidUpdate(false);
        }
        if (items.length > itemsPerPage && items.length % itemsPerPage !== 0) {
            if (currentPage === totalPages) {
                setDownArrowImage(images.downArrowSolid);
            } else {
                setDownArrowImage(images.downArrowGreen);
            }
        } else {
            setDownArrowImage(images.downArrowSolid);
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedItems(items.slice(startIndex, endIndex));
    };
    
    const handleDownArrowClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setUpArrowImage(images.upArrowGreen);
            if (currentPage + 1 === totalPages) {
                setDownArrowImage(images.downArrowSolid);
            }
        } else {
            setDownArrowImage(images.downArrowSolid);
        }
    };

    const handleUpArrowClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setUpArrowImage(images.upArrowGreen);
            if (currentPage - 1 === 1) {
                setUpArrowImage(images.upArrowSolid);
            }
        } else {
            setUpArrowImage(images.upArrowSolid);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };



    return (
        <div className={styles.bucketBottom}>
           <div className={styles.upArrowHolder} onClick={handleUpArrowClick}>
                    <div className={styles.upArrow}
                        style={{ backgroundImage: `url(${upArrowImage})`}}></div>
                </div>
                <div className={styles.body}>
                    {displayedItems.map((item, index) => (
                        <div 
                            key={index} 
                            className={styles.item} 
                            style={{ backgroundImage: `url(${item.image})` }}
                            onClick={() => handleItemClick(item)}
                            >
                                {selectedItem === item && (
                                    <div className={styles.highlightedImage} > 
                                        <img src={selectedImage} alt="Highlighted" />
                                    </div>
                                )}
                        </div>
                    ))}
                </div>
                <div className={styles.downArrowHolder} onClick={handleDownArrowClick}>
                    <div className={styles.downArrow}
                         style={{ backgroundImage: `url(${downArrowImage})`}}></div>
                </div>
        </div>
    );
}

export default BucketBottom;