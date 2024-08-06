import React, { useState, useEffect } from 'react';
import styles from './SnapShotBody.module.css';
import { HelpComponent, IconComponent } from "../../../../../../Common/index";
import { snapshotData } from "./SnapShotBodyResourceStack/index";
import selectedImage from './SnapShotBodyResourceStack/selected.png';

const SnapShotBody = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(snapshotData.downArrowGold);
    const [upArrowImage, setUpArrowImage] = useState(snapshotData.upArrowGold);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const items = snapshotData.body;
    const itemsPerPage = 9;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        setWorldsTheme();
    }, [currentPage, items]);

    const setWorldsTheme = () => {
        const theme = snapshotData;
        if (items.length > 9 && items.length % 9 !== 0) {
            if (currentPage === totalPages) {
                setDownArrowImage(theme.downArrowGold);
            } else {
                setDownArrowImage(theme.downArrowGreen);
            }
        } else {
            setDownArrowImage(theme.downArrowGold);
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedItems(items.slice(startIndex, endIndex));
    };
    
    const handleDownArrowClick = () => {
        const theme = snapshotData;
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setUpArrowImage(theme.upArrowGreen);
            if (currentPage + 1 === totalPages) {
                setDownArrowImage(theme.downArrowGold);
            }
        } else {
            setDownArrowImage(theme.downArrowGold);
        }
    };

    const handleUpArrowClick = () => {
        const theme = snapshotData;
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setUpArrowImage(theme.upArrowGreen);
            if (currentPage - 1 === 1) {
                setUpArrowImage(theme.upArrowGold);
            }
        } else {
            setUpArrowImage(theme.upArrowGold);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const printImage = () => {
        console.log(selectedItem.image);
    };

    return (
        <div className={styles.snapshotBody}>
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
            <div className={styles.lowerContent}>
                <div className={styles.iconComponentHolder}
                onClick={printImage}>
                    <IconComponent type={'print'} placeholderImage={snapshotData.placeHolderPrint} frames={snapshotData.print} />
                </div>
                <div className={styles.iconComponentHolder}>
                    <IconComponent type={'destroy'} placeholderImage={snapshotData.placeHolderDestroy} frames={snapshotData.destroy} />
                </div>
                <div className={styles.iconComponentHolder}>
                    <IconComponent type={'delete'} placeholderImage={snapshotData.placeHolderDelete} frames={snapshotData.delete} />
                </div>
            </div>
            <div className={styles.helpComponentHolder}>
                <HelpComponent placeholderImage={snapshotData.placeholderHelper} frames={snapshotData.helperFrames} />
            </div>
        </div>
    )
}

export default SnapShotBody;