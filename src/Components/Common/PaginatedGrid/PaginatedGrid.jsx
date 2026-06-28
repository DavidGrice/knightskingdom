import React from 'react';
import GridThumbnail from './GridThumbnail';

const PaginatedGrid = ({
  styles,
  rootClassName = '',
  rootStyle = null,
  displayedItems,
  upArrowImage,
  downArrowImage,
  selectedItem,
  selectionOverlay,
  onUpArrowClick,
  onDownArrowClick,
  onItemClick,
  getItemKey = (item, index) => index,
  isItemDisabled = () => false,
  isItemInteractive = (item) => Boolean(item?.image),
  renderItemOverlay = null,
  footer = null,
  helpCorner = null,
}) => (
  <div className={`${styles.gridRoot} ${rootClassName}`.trim()} style={rootStyle || undefined}>
    <div className={styles.upArrowHolder} onClick={onUpArrowClick}>
      <div
        className={styles.upArrow}
        style={{ backgroundImage: `url(${upArrowImage})` }}
      />
    </div>
    <div className={styles.body}>
      {displayedItems.map((item, index) => {
        const interactive = isItemInteractive(item) && !isItemDisabled(item);
        const isSelected = selectedItem != null
          && getItemKey(selectedItem, index) === getItemKey(item, index);
        const useThumbnail = Boolean(styles.itemThumbnail);
        const itemClassName = [
          styles.item,
          interactive && styles.itemInteractive,
          isSelected && styles.itemSelected,
        ].filter(Boolean).join(' ');

        return (
        <div
          key={getItemKey(item, index)}
          className={itemClassName}
          style={{
            ...(!useThumbnail && item.image ? {
              backgroundImage: `url(${JSON.stringify(item.image)})`,
            } : {}),
            pointerEvents: interactive ? 'auto' : 'none',
          }}
          onClick={() => {
            if (interactive) {
              onItemClick(item);
            }
          }}
        >
          {item.image && useThumbnail ? (
            <GridThumbnail
              src={item.image}
              className={styles.itemThumbnail}
            />
          ) : null}
          {isSelected && selectionOverlay ? (
            <div className={styles.highlightedImage}>
              <img src={selectionOverlay} alt="Selected" />
            </div>
          ) : null}
          {renderItemOverlay ? renderItemOverlay(item) : null}
        </div>
        );
      })}
    </div>
    <div className={styles.downArrowHolder} onClick={onDownArrowClick}>
      <div
        className={styles.downArrow}
        style={{ backgroundImage: `url(${downArrowImage})` }}
      />
    </div>
    {footer}
    {helpCorner}
  </div>
);

export default PaginatedGrid;