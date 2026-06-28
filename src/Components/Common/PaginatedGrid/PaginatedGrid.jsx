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
      {displayedItems.map((item, index) => (
        <div
          key={getItemKey(item, index)}
          className={styles.item}
          onClick={() => {
            if (!isItemDisabled(item)) {
              onItemClick(item);
            }
          }}
        >
          {item.image ? (
            <GridThumbnail
              src={item.image}
              className={styles.itemThumbnail}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                position: 'absolute',
                inset: 0,
              }}
            />
          ) : null}
          {selectedItem === item && selectionOverlay ? (
            <div className={styles.highlightedImage}>
              <img src={selectionOverlay} alt="Selected" />
            </div>
          ) : null}
          {renderItemOverlay ? renderItemOverlay(item) : null}
        </div>
      ))}
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