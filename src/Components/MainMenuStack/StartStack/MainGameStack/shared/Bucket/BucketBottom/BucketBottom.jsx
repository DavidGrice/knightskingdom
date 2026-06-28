import React, { useState, useEffect } from 'react';
import styles from './BucketBottom.module.css';
import selectedImage from '../../../MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/wh_selection.png';

const BucketBottom = ({ activeBucket, didUpdate, setDidUpdate, tabData, arrowImages, onItemSelect }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(arrowImages.downArrowSolid);
    const [upArrowImage, setUpArrowImage] = useState(arrowImages.upArrowSolid);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);

    const items = tabData[activeBucket] || tabData[0];
    const itemsPerPage = 6;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        if (didUpdate) {
            setCurrentPage(1);
            setDisplayedItems([]);
            setSelectedItem(null);
            setDidUpdate(false);
        }
        if (items.length > itemsPerPage && items.length % itemsPerPage !== 0) {
            if (currentPage === totalPages) {
                setDownArrowImage(arrowImages.downArrowSolid);
            } else {
                setDownArrowImage(arrowImages.downArrowGreen);
            }
        } else {
            setDownArrowImage(arrowImages.downArrowSolid);
        }
        if (currentPage === 1) {
            setUpArrowImage(arrowImages.upArrowSolid);
        } else {
            setUpArrowImage(arrowImages.upArrowGreen);
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedItems(items.slice(startIndex, endIndex));
    }, [currentPage, items, didUpdate, setDidUpdate, arrowImages, totalPages, itemsPerPage]);

    const handleDownArrowClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setUpArrowImage(arrowImages.upArrowGreen);
            if (currentPage + 1 === totalPages) {
                setDownArrowImage(arrowImages.downArrowSolid);
            }
        } else {
            setDownArrowImage(arrowImages.downArrowSolid);
        }
    };

    const handleUpArrowClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setUpArrowImage(arrowImages.upArrowGreen);
            if (currentPage - 1 === 1) {
                setUpArrowImage(arrowImages.upArrowSolid);
            }
        } else {
            setUpArrowImage(arrowImages.upArrowSolid);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        if (onItemSelect) {
            onItemSelect(item);
        }
    };

    return (
        <div className={styles.bucketBottom}>
            <div className={styles.upArrowHolder} onClick={handleUpArrowClick}>
                <div className={styles.upArrow} style={{ backgroundImage: `url(${upArrowImage})` }} />
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
                            <div className={styles.highlightedImage}>
                                <img src={selectedImage} alt="Highlighted" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className={styles.downArrowHolder} onClick={handleDownArrowClick}>
                <div className={styles.downArrow} style={{ backgroundImage: `url(${downArrowImage})` }} />
            </div>
        </div>
    );
};

export default BucketBottom;