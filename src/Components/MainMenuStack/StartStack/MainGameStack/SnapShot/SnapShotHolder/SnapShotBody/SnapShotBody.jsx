import React, { useEffect, useMemo } from 'react';
import styles from './SnapShotBody.module.css';
import { HelpComponent, IconComponent, PaginatedGrid, usePaginatedGrid } from '../../../../../../Common';
import { mergeSnapshotLists } from '@/api/worldSave';
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

const SnapShotBody = ({
  selectedProfile,
  mapData,
  onRemoveSnapshot,
  onSelectSnapshot,
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
      .filter((entry) => entry.imageDataUrl)
      .map((entry) => ({
        ...entry,
        image: entry.imageDataUrl,
      }));
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
    itemsPerPage: 9,
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
      onSelectSnapshot?.(null);
      return;
    }
    const stillValid = selectedItem
      && snapshotItems.some((entry) => entry.id === selectedItem.id);
    if (!stillValid) {
      const initial = snapshotItems[0];
      setSelectedItem(initial);
      onSelectSnapshot?.(initial);
    }
  }, [snapshotItems, selectedItem, onSelectSnapshot, setSelectedItem]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onSelectSnapshot?.(item);
  };

  const handleDelete = () => {
    if (!selectedItem || !mapData?.id || !onRemoveSnapshot) {
      return;
    }
    onRemoveSnapshot(mapData.id, selectedItem.id);
    setSelectedItem(null);
    onSelectSnapshot?.(null);
  };

  const handlePrint = () => {
    if (!selectedItem?.imageDataUrl) {
      return;
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(
      `<html><head><title>Snapshot</title></head><body style="margin:0">`
      + `<img src="${selectedItem.imageDataUrl}" style="width:100%" onload="window.print();window.close()" />`
      + `</body></html>`,
    );
    printWindow.document.close();
  };

  const footer = (
    <div className={styles.lowerContent}>
      <div className={styles.iconComponentHolder} onClick={handlePrint}>
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
      <div className={styles.iconComponentHolder} onClick={handleDelete}>
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

  if (snapshotItems.length === 0) {
    return (
      <div className={styles.snapshotBody}>
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
      getItemKey={(item) => item.id}
      footer={footer}
      helpCorner={helpCorner}
    />
  );
};

export default SnapShotBody;