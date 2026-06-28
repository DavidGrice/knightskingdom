import React, { useEffect, useMemo } from 'react';
import styles from './MyModelsBody.module.css';
import { HelpComponent, IconComponent, PaginatedGrid, usePaginatedGrid } from '../../../../../Common';
import { getSavedWorldsList, resolveSnapshotImage } from '../../../../../../api/worldSave';
import { myModelsData } from '../MyModelsResourceStack';

const paginatedStyles = {
  gridRoot: styles.modelsBody,
  upArrowHolder: styles.upArrowHolder,
  upArrow: styles.upArrow,
  body: styles.body,
  item: styles.item,
  highlightedImage: styles.highlightedImage,
  downArrowHolder: styles.downArrowHolder,
  downArrow: styles.downArrow,
};

const MyModelsBody = ({ selectedProfile, onDeleteSavedWorld }) => {
  const savedItems = useMemo(() => {
    const entries = getSavedWorldsList(selectedProfile);
    return entries.map((entry, index) => {
      const snapshotThumb = resolveSnapshotImage(entry.snapshots?.[0]);
      return {
        ...entry,
        image: entry.image || snapshotThumb
          || myModelsData.loadPlaceholders[index % myModelsData.loadPlaceholders.length],
      };
    });
  }, [selectedProfile]);

  const {
    displayedItems,
    upArrowImage,
    downArrowImage,
    selectedItem,
    setSelectedItem,
    handleDownArrowClick,
    handleUpArrowClick,
  } = usePaginatedGrid({
    items: savedItems,
    itemsPerPage: 9,
    arrows: {
      upSolid: myModelsData.upArrowGold,
      upGreen: myModelsData.upArrowGreen,
      downSolid: myModelsData.downArrowGold,
      downGreen: myModelsData.downArrowGreen,
    },
  });

  useEffect(() => {
    if (savedItems.length === 0) {
      setSelectedItem(null);
      return;
    }
    const stillValid = selectedItem
      && savedItems.some((entry) => entry.id === selectedItem.id);
    if (!stillValid) {
      setSelectedItem(savedItems[0]);
    }
  }, [savedItems, selectedItem, setSelectedItem]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleDelete = () => {
    if (selectedItem && onDeleteSavedWorld) {
      onDeleteSavedWorld(selectedItem.worldId);
      setSelectedItem(null);
    }
  };

  const footer = (
    <div className={styles.lowerContent}>
      <div className={styles.iconComponentHolder}>
        <IconComponent
          type="copy"
          placeholderImage={myModelsData.copyPlaceholder}
          frames={myModelsData.copyFrames}
        />
      </div>
      <div className={styles.iconComponentHolder} onClick={handleDelete}>
        <IconComponent
          type="delete"
          placeholderImage={myModelsData.deletePlaceholder}
          frames={myModelsData.deleteFrames}
        />
      </div>
    </div>
  );

  const helpCorner = (
    <div className={styles.helpComponentHolder}>
      <HelpComponent
        placeholderImage={myModelsData.placeholderHelper}
        frames={myModelsData.helperFrames}
      />
    </div>
  );

  if (savedItems.length === 0) {
    return (
      <div className={styles.modelsBody}>
        <div className={styles.emptyMessage}>
          No saved worlds yet. Return to the game and use the save icon.
        </div>
        {helpCorner}
      </div>
    );
  }

  return (
    <PaginatedGrid
      styles={paginatedStyles}
      displayedItems={displayedItems}
      upArrowImage={upArrowImage}
      downArrowImage={downArrowImage}
      selectedItem={selectedItem}
      selectionOverlay={myModelsData.selectedOverlay}
      onUpArrowClick={handleUpArrowClick}
      onDownArrowClick={handleDownArrowClick}
      onItemClick={handleItemClick}
      getItemKey={(item) => item.id}
      footer={footer}
      helpCorner={helpCorner}
    />
  );
};

export default MyModelsBody;