import React, { useMemo } from 'react';
import gameStyles from './BucketBottom.module.css';
import workshopStyles from './BucketBottom.workshop.module.css';
import selectedImage from '../../../MainGame/ComponentTop/Bucket/BucketBottom/BucketBottomResourceStack/wh_selection.png';
import usePaginatedGrid from '../../../../../../Common/usePaginatedGrid';

const BucketBottom = ({ variant = 'game', activeBucket, resetKey, tabData, arrowImages, onItemSelect }) => {
    const styles = variant === 'workshop' ? workshopStyles : gameStyles;
    const items = useMemo(
        () => tabData[activeBucket] || tabData[0] || [],
        [tabData, activeBucket]
    );

    const arrows = useMemo(
        () => ({
            upSolid: arrowImages.upArrowSolid,
            upGreen: arrowImages.upArrowGreen,
            downSolid: arrowImages.downArrowSolid,
            downGreen: arrowImages.downArrowGreen,
        }),
        [
            arrowImages.upArrowSolid,
            arrowImages.upArrowGreen,
            arrowImages.downArrowSolid,
            arrowImages.downArrowGreen,
        ]
    );

    const {
        displayedItems,
        downArrowImage,
        upArrowImage,
        selectedItem,
        setSelectedItem,
        handleDownArrowClick,
        handleUpArrowClick,
    } = usePaginatedGrid({
        items,
        itemsPerPage: 6,
        arrows,
        resetToken: resetKey,
    });

    const handleItemClick = (item) => {
        setSelectedItem(item);
        onItemSelect?.(item);
    };

    return (
        <div className={styles.bucketBottom}>
            <div className={styles.upArrowHolder} onClick={handleUpArrowClick}>
                <div className={styles.upArrow} style={{ backgroundImage: `url(${upArrowImage})` }} />
            </div>
            <div className={styles.body}>
                {displayedItems.map((item, index) => (
                    <div
                        key={item.name ?? index}
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