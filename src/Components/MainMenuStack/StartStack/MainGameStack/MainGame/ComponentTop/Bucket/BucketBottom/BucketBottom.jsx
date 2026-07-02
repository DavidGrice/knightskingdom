import React from 'react';
import styles from './BucketBottom.module.css';
import {
  images,
  buildingsData,
  challengesData,
  explosivesData,
  minifigureAnimalsData,
  sceneryData,
  vehiclesData,
} from './BucketBottomResourceStack/index';
import selectedImage from './BucketBottomResourceStack/wh_selection.png';
import { PaginatedGrid, usePaginatedGrid } from '../../../../../../../Common/index';

const paginatedStyles = {
  gridRoot: styles.bucketBottom,
  upArrowHolder: styles.upArrowHolder,
  upArrow: styles.upArrow,
  body: styles.body,
  item: styles.item,
  highlightedImage: styles.highlightedImage,
  downArrowHolder: styles.downArrowHolder,
  downArrow: styles.downArrow,
};

const bucketDataByTab = {
  0: minifigureAnimalsData,
  1: buildingsData,
  2: vehiclesData,
  3: sceneryData,
  4: explosivesData,
  5: challengesData,
};

const BucketBottom = ({ activeBucket, didUpdate, setDidUpdate, handleLoadModel }) => {
  const items = bucketDataByTab[activeBucket] ?? minifigureAnimalsData;

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
    itemsPerPage: 6,
    arrows: {
      upSolid: images.upArrowSolid,
      upGreen: images.upArrowGreen,
      downSolid: images.downArrowSolid,
      downGreen: images.downArrowGreen,
    },
    resetToken: didUpdate,
    onReset: () => setDidUpdate(false),
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    handleLoadModel(item.SelectedModel);
  };

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
    />
  );
};

export default BucketBottom;