import React, { useState, useEffect } from "react";
import styles from "./WorldBody.module.css";
import { HelpComponent, IconComponent } from "../../../../Common/index";
import { localWorldTheme, localWorldsData, sharedWorldTheme, sharedWorldsData} from "./WorldBodyResourceStack/index";
import selectedImage from './WorldBodyResourceStack/selected.png';

const WorldBody = ({ isLocalWorlds, didUpdate, setDidUpdate, setWorldData }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [downArrowImage, setDownArrowImage] = useState(localWorldTheme.downArrowSolid);
    const [upArrowImage, setUpArrowImage] = useState(localWorldTheme.upArrowSolid);
    const [displayedItems, setDisplayedItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const items = isLocalWorlds ? localWorldsData : sharedWorldsData;
    const itemsPerPage = 9;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    useEffect(() => {
        setWorldsTheme();
    }, [currentPage, items, localWorldTheme, sharedWorldTheme, isLocalWorlds]);

    const setWorldsTheme = () => {
        if (didUpdate) {
            if (isLocalWorlds) {
                setDownArrowImage(localWorldTheme.downArrowSolid);
                setUpArrowImage(localWorldTheme.upArrowSolid);
            } else {
                setDownArrowImage(sharedWorldTheme.downArrowSolid);
                setUpArrowImage(sharedWorldTheme.upArrowSolid);
            }
            setCurrentPage(1);
            setDisplayedItems([]);
            setSelectedItem(null);
            setDidUpdate(false);
        }
        const theme = isLocalWorlds ? localWorldTheme : sharedWorldTheme;
        if (items.length > 9 && items.length % 9 !== 0) {
            if (currentPage === totalPages) {
                setDownArrowImage(theme.downArrowSolid);
            } else {
                setDownArrowImage(theme.downArrowGreen);
            }
        } else {
            setDownArrowImage(theme.downArrowSolid);
        }
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayedItems(items.slice(startIndex, endIndex));

    };
    
    const handleDownArrowClick = () => {
        const theme = isLocalWorlds ? localWorldTheme : sharedWorldTheme;
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            setUpArrowImage(theme.upArrowGreen);
            if (currentPage + 1 === totalPages) {
                setDownArrowImage(theme.downArrowSolid);
            }
        } else {
            setDownArrowImage(theme.downArrowSolid);
        }
    };

    const handleUpArrowClick = () => {
        const theme = isLocalWorlds ? localWorldTheme : sharedWorldTheme;
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            setUpArrowImage(theme.upArrowGreen);
            if (currentPage - 1 === 1) {
                setUpArrowImage(theme.upArrowSolid);
            }
        } else {
            setUpArrowImage(theme.upArrowSolid);
        }
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setWorldData(item);
    };

    return (
        isLocalWorlds ? (
            <div className={styles.worldsHolder}
                 style={{ backgroundImage: `url(${localWorldTheme.body})`  }}>
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
                <div className={styles.helpComponentHolder}>
                    <HelpComponent placeholderImage={localWorldTheme.placeholderHelper} frames={localWorldTheme.frames} />
                </div>
            </div>
            ) : (
                <div className={styles.worldsHolder}
                    style={{ backgroundImage: `url(${sharedWorldTheme.body})`  }}>
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
                        <div className={styles.iconComponentHolder}>
                            <IconComponent type={'save'} placeholderImage={sharedWorldTheme.placeHolderSave} frames={sharedWorldTheme.saveFrames} />
                        </div>
                        <div className={styles.iconComponentHolder}>
                            <IconComponent type={'load'} placeholderImage={sharedWorldTheme.placeHolderLoad} frames={sharedWorldTheme.loadFrames} />
                        </div>
                        <div className={styles.iconComponentHolder}>
                            <IconComponent type={'copy'} placeholderImage={sharedWorldTheme.placeHolderCopy} frames={sharedWorldTheme.copyFrames} />
                        </div>
                        <div className={styles.iconComponentHolder}>
                            <IconComponent type={'trash'} placeholderImage={sharedWorldTheme.placeHolderTrash} frames={sharedWorldTheme.trashFrames} />
                        </div>
                    </div>
                    <div className={styles.helpComponentHolder}>
                        <HelpComponent placeholderImage={sharedWorldTheme.placeholderHelper} frames={sharedWorldTheme.helperFrames} />
                    </div>
                </div>
        )
    );
}

export default WorldBody;