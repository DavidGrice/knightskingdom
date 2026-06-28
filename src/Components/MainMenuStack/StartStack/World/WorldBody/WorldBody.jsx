import React from 'react';
import styles from './WorldBody.module.css';
import { HelpComponent, IconComponent, PaginatedGrid, usePaginatedGrid } from '../../../../Common/index';
import {
  localWorldTheme,
  localWorldsData,
  sharedWorldTheme,
  sharedWorldsData,
} from './WorldBodyResourceStack/index';
import selectedImage from './WorldBodyResourceStack/selected.png';

const paginatedStyles = {
  gridRoot: styles.worldsHolder,
  upArrowHolder: styles.upArrowHolder,
  upArrow: styles.upArrow,
  body: styles.body,
  item: styles.item,
  highlightedImage: styles.highlightedImage,
  downArrowHolder: styles.downArrowHolder,
  downArrow: styles.downArrow,
};

const WorldBody = ({ isLocalWorlds, didUpdate, setDidUpdate, setWorldData }) => {
  const theme = isLocalWorlds ? localWorldTheme : sharedWorldTheme;
  const items = isLocalWorlds ? localWorldsData : sharedWorldsData;

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
      upSolid: theme.upArrowSolid,
      upGreen: theme.upArrowGreen,
      downSolid: theme.downArrowSolid,
      downGreen: theme.downArrowGreen,
    },
    resetToken: didUpdate,
    onReset: () => {
      setWorldData(null);
      setDidUpdate(false);
    },
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setWorldData(item);
  };

  const sharedWorldActions = !isLocalWorlds ? (
    <div className={styles.lowerContent}>
      <div className={styles.iconComponentHolder}>
        <IconComponent
          type="save"
          placeholderImage={sharedWorldTheme.placeHolderSave}
          frames={sharedWorldTheme.saveFrames}
        />
      </div>
      <div className={styles.iconComponentHolder}>
        <IconComponent
          type="load"
          placeholderImage={sharedWorldTheme.placeHolderLoad}
          frames={sharedWorldTheme.loadFrames}
        />
      </div>
      <div className={styles.iconComponentHolder}>
        <IconComponent
          type="copy"
          placeholderImage={sharedWorldTheme.placeHolderCopy}
          frames={sharedWorldTheme.copyFrames}
        />
      </div>
      <div className={styles.iconComponentHolder}>
        <IconComponent
          type="trash"
          placeholderImage={sharedWorldTheme.placeHolderTrash}
          frames={sharedWorldTheme.trashFrames}
        />
      </div>
    </div>
  ) : null;

  const helpCorner = (
    <div className={styles.helpComponentHolder}>
      <HelpComponent
        placeholderImage={theme.placeholderHelper}
        frames={isLocalWorlds ? theme.frames : theme.helperFrames}
      />
    </div>
  );

  return (
    <PaginatedGrid
      styles={paginatedStyles}
      rootStyle={{ backgroundImage: `url(${theme.body})` }}
      displayedItems={displayedItems}
      upArrowImage={upArrowImage}
      downArrowImage={downArrowImage}
      selectedItem={selectedItem}
      selectionOverlay={selectedImage}
      onUpArrowClick={handleUpArrowClick}
      onDownArrowClick={handleDownArrowClick}
      onItemClick={handleItemClick}
      getItemKey={(item) => item.id}
      isItemDisabled={(item) => item.isLocked}
      footer={sharedWorldActions}
      helpCorner={helpCorner}
    />
  );
};

export default WorldBody;