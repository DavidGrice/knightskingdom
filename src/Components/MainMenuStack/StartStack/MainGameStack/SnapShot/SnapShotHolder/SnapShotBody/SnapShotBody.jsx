import React from 'react';
import styles from './SnapShotBody.module.css';
import { HelpComponent, IconComponent, PaginatedGrid, usePaginatedGrid } from '../../../../../../Common/index';
import { snapshotData } from './SnapShotBodyResourceStack/index';
import selectedImage from './SnapShotBodyResourceStack/selected.png';

const paginatedStyles = {
  gridRoot: styles.snapshotBody,
  upArrowHolder: styles.upArrowHolder,
  upArrow: styles.upArrow,
  body: styles.body,
  item: styles.item,
  highlightedImage: styles.highlightedImage,
  downArrowHolder: styles.downArrowHolder,
  downArrow: styles.downArrow,
};

const SnapShotBody = () => {
  const items = snapshotData.body;

  const {
    displayedItems,
    upArrowImage,
    downArrowImage,
    selectedItem,
    setSelectedItem,
    handleDownArrowClick,
    handleUpArrowClick,
  } = usePaginatedGrid({
    items,
    itemsPerPage: 9,
    arrows: {
      upSolid: snapshotData.upArrowGold,
      upGreen: snapshotData.upArrowGreen,
      downSolid: snapshotData.downArrowGold,
      downGreen: snapshotData.downArrowGreen,
    },
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const footer = (
    <div className={styles.lowerContent}>
      <div className={styles.iconComponentHolder} onClick={() => selectedItem && console.log(selectedItem.image)}>
        <IconComponent
          type="print"
          placeholderImage={snapshotData.placeHolderPrint}
          frames={snapshotData.print}
        />
      </div>
      <div className={styles.iconComponentHolder}>
        <IconComponent
          type="destroy"
          placeholderImage={snapshotData.placeHolderDestroy}
          frames={snapshotData.destroy}
        />
      </div>
      <div className={styles.iconComponentHolder}>
        <IconComponent
          type="delete"
          placeholderImage={snapshotData.placeHolderDelete}
          frames={snapshotData.delete}
        />
      </div>
    </div>
  );

  const helpCorner = (
    <div className={styles.helpComponentHolder}>
      <HelpComponent
        placeholderImage={snapshotData.placeholderHelper}
        frames={snapshotData.helperFrames}
      />
    </div>
  );

  return (
    <PaginatedGrid
      styles={paginatedStyles}
      displayedItems={displayedItems}
      upArrowImage={upArrowImage}
      downArrowImage={downArrowImage}
      selectedItem={selectedItem}
      selectionOverlay={selectedImage}
      onUpArrowClick={handleUpArrowClick}
      onDownArrowClick={handleDownArrowClick}
      onItemClick={handleItemClick}
      getItemKey={(item, index) => item.id ?? index}
      footer={footer}
      helpCorner={helpCorner}
    />
  );
};

export default SnapShotBody;