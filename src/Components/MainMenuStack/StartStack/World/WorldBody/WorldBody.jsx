import React, { useState, useEffect } from "react";
import styles from "./WorldBody.module.css";
import { HelpComponent } from "../../../../Common/index";
import { lightFrames, localWorldsData, sharedWorldsData,
         darkFrames, sharedWorldCopyFrames, sharedWorldLoadFrames,
         sharedWorldSaveFrames, sharedWorldTrashFrames } from "./WorldBodyResourceStack/index";
import LightHelp2 from './WorldBodyResourceStack/LocalWorldsFrames/light_help_2.png';
import DarkHelp2 from './WorldBodyResourceStack/SharedWorldsFrames/dark_help_2.png';
import selectedImage from './WorldBodyResourceStack/selected.png';

const WorldBody = ({ isLocalWorlds }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(styles.downArrow);
    const [upArrowImage, setUpArrowImage] = useState(styles.upArrow);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const items = isLocalWorlds ? localWorldsData : sharedWorldsData;
    const itemsPerPage = 9;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        if (items.length > 9 && items.length % 9 !== 0) {
            setDownArrowImage(styles.downArrowGreen);
        } else {
            setDownArrowImage(styles.downArrow);
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedItems(items.slice(startIndex, endIndex));
    }, [currentPage, items]);

    const handleDownArrowClick = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setUpArrowImage(styles.upArrowGreen);
        }
    };

    const handleUpArrowClick = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            if (currentPage - 1 === 1) {
                setUpArrowImage(styles.upArrow);
            }
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        console.log('Selected item:', item);
    };

    return (
        isLocalWorlds ? (
            <div className={styles.worldsHolder}>
                <div className={styles.upArrowHolder} onClick={handleUpArrowClick}>
                    <div className={styles.upArrow}></div>
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
                    <div className={styles.downArrow}></div>
                </div>
                <div className={styles.lowerContent}></div>
                <div className={styles.helpComponentHolder}>
                    <HelpComponent placeholderImage={LightHelp2} frames={lightFrames} />
                </div>
            </div>
            ) : (
                <div className={styles.worldsHolder}>
                    <div className={styles.upArrowHolder} onClick={handleUpArrowClick}>
                        <div className={styles.upArrow}></div>
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
                        <div className={styles.downArrow}></div>
                    </div>
                    <div className={styles.lowerContent}></div>
                    <div className={styles.helpComponentHolder}>
                        <HelpComponent placeholderImage={DarkHelp2} frames={darkFrames} />
                    </div>
                </div>
        )
    );
}

export default WorldBody;