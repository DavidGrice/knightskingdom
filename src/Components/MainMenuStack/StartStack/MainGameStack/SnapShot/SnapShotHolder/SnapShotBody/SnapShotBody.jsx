import React, { useEffect, useMemo } from 'react';
import styles from './SnapShotBody.module.css';
import { HelpComponent, IconComponent, PaginatedGrid, usePaginatedGrid } from '../../../../../../Common';
import { createHolderGridStyles, footerPositionStyle, HOLDER_VARIANTS } from '../../../../../../Common/HolderGridLayout';
import { mergeSnapshotLists, normalizeSnapshotEntry, resolveSnapshotImage } from '@/api/worldSave';
import { snapshotData } from './SnapShotBodyResourceStack/index';
import selectedImage from './SnapShotBodyResourceStack/selected.png';

const ITEMS_PER_PAGE = 9;

const paginatedStyles = createHolderGridStyles(HOLDER_VARIANTS.SNAPSHOT, {
  item: styles.item,
  itemInteractive: styles.itemInteractive,
  iconComponentHolder: styles.iconComponentHolder,
});

const footerStyle = footerPositionStyle(HOLDER_VARIANTS.SNAPSHOT);

const SnapShotBody = ({
  selectedProfile,
  mapData,
  onRemoveSnapshot,
}) => {
  const snapshotItems = useMemo(() => {
    const profileSnapshots = selectedProfile?.savedWorlds?.[String(mapData?.id)]?.snapshots || [];
    const sessionSnapshots = mapData?.snapshots || [];
    const latestSnapshot = mapData?.sceneSnapshot ? [mapData.sceneSnapshot] : [];
    const merged = mergeSnapshotLists(
      profileSnapshots,
      sessionSnapshots,
      latestSnapshot,
    );

    return merged
      .map((entry) => normalizeSnapshotEntry(entry))
      .filter(Boolean);
  }, [selectedProfile, mapData?.id, mapData?.snapshots, mapData?.sceneSnapshot]);

  const {
    displayedItems,
    upArrowImage,
    downArrowImage,
    selectedItem,
    setSelectedItem,
    handleDownArrowClick,
    handleUpArrowClick,
  } = usePaginatedGrid({
    items: snapshotItems,
    itemsPerPage: ITEMS_PER_PAGE,
    arrows: {
      upSolid: snapshotData.upArrowGold,
      upGreen: snapshotData.upArrowGreen,
      downSolid: snapshotData.downArrowGold,
      downGreen: snapshotData.downArrowGreen,
    },
  });

  useEffect(() => {
    if (snapshotItems.length === 0) {
      setSelectedItem(null);
      return;
    }
    const stillValid = selectedItem
      && snapshotItems.some((entry) => entry.id === selectedItem.id);
    if (!stillValid) {
      setSelectedItem(snapshotItems[0]);
    }
  }, [snapshotItems, selectedItem, setSelectedItem]);

  const handleItemClick = (item) => {
    if (!item?.image) {
      return;
    }
    setSelectedItem(item);
  };

  const handleDelete = () => {
    if (!selectedItem || !mapData?.id || !onRemoveSnapshot) {
      return;
    }
    onRemoveSnapshot(mapData.id, selectedItem.id);
    setSelectedItem(null);
  };

  const handlePrint = () => {
    const imageSrc = resolveSnapshotImage(selectedItem);
    if (!imageSrc) {
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(
      `<html><head><title>Snapshot</title></head><body style="margin:0">`
      + `<img src="${imageSrc}" style="width:100%" onload="window.print();window.close()" />`
      + `</body></html>`,
    );
    printWindow.document.close();
  };

  const footer = (
    <div className={paginatedStyles.lowerContent} style={footerStyle}>
      <div className={paginatedStyles.iconComponentHolder} onClick={handlePrint}>
        <IconComponent
          type="print"
          placeholderImage={snapshotData.placeHolderPrint}
          frames={snapshotData.print}
        />
      </div>
      <div className={paginatedStyles.iconComponentHolder}>
        <IconComponent
          type="destroy"
          placeholderImage={snapshotData.placeHolderDestroy}
          frames={snapshotData.destroy}
        />
      </div>
      <div className={paginatedStyles.iconComponentHolder} onClick={handleDelete}>
        <IconComponent
          type="delete"
          placeholderImage={snapshotData.placeHolderDelete}
          frames={snapshotData.delete}
        />
      </div>
    </div>
  );

  const helpCorner = (
    <div className={paginatedStyles.helpComponentHolder}>
      <HelpComponent
        placeholderImage={snapshotData.placeholderHelper}
        frames={snapshotData.helperFrames}
      />
    </div>
  );

  if (snapshotItems.length === 0) {
    return (
      <div className={paginatedStyles.gridRoot}>
        <div className={styles.emptyMessage}>
          No snapshots yet. Use the camera icon in-game to capture your world.
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
      selectionOverlay={selectedImage}
      onUpArrowClick={handleUpArrowClick}
      onDownArrowClick={handleDownArrowClick}
      onItemClick={handleItemClick}
      isItemInteractive={(item) => Boolean(item?.image)}
      getItemKey={(item) => item.id}
      footer={footer}
      helpCorner={helpCorner}
    />
  );
};

export default SnapShotBody;