import React from 'react';
import styles from './BucketBottom.module.css';
import {
  images,
  archesData,
  basicData,
  castleAccessoriesData,
  castleComponentsData,
  challengesData,
  cylindricalData,
  slimData,
  tilesData,
  wedgeData,
  windowsDoorsFencesData,
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
  0: basicData,
  1: slimData,
  2: wedgeData,
  3: cylindricalData,
  4: archesData,
  5: castleComponentsData,
  6: windowsDoorsFencesData,
  7: castleAccessoriesData,
  8: tilesData,
  9: challengesData,
};

const BucketBottom = ({ activeBucket, didUpdate, setDidUpdate }) => {
  const items = bucketDataByTab[activeBucket] ?? basicData;

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
      onItemClick={(item) => setSelectedItem(item)}
      getItemKey={(item, index) => item.id ?? index}
    />
  );
};

export default BucketBottom;