import { useState, useEffect, useCallback } from 'react';

const usePaginatedGrid = ({
  items,
  itemsPerPage,
  arrows,
  resetToken = false,
  onReset,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [downArrowImage, setDownArrowImage] = useState(arrows.downSolid);
  const [upArrowImage, setUpArrowImage] = useState(arrows.upSolid);
  const [displayedItems, setDisplayedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

  useEffect(() => {
    if (resetToken) {
      setCurrentPage(1);
      setDisplayedItems([]);
      setSelectedItem(null);
      onReset?.();
    }

    if (items.length > itemsPerPage && items.length % itemsPerPage !== 0) {
      if (currentPage === totalPages) {
        setDownArrowImage(arrows.downSolid);
      } else {
        setDownArrowImage(arrows.downGreen);
      }
    } else {
      setDownArrowImage(arrows.downSolid);
    }

    if (currentPage === 1) {
      setUpArrowImage(arrows.upSolid);
    } else {
      setUpArrowImage(arrows.upGreen);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedItems(items.slice(startIndex, endIndex));
  }, [
    arrows.downGreen,
    arrows.downSolid,
    arrows.upGreen,
    arrows.upSolid,
    currentPage,
    items,
    itemsPerPage,
    onReset,
    resetToken,
    totalPages,
  ]);

  const handleDownArrowClick = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((page) => page + 1);
    }
  }, [currentPage, totalPages]);

  const handleUpArrowClick = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((page) => page - 1);
    }
  }, [currentPage]);

  return {
    currentPage,
    displayedItems,
    downArrowImage,
    upArrowImage,
    selectedItem,
    setSelectedItem,
    handleDownArrowClick,
    handleUpArrowClick,
    totalPages,
  };
};

export default usePaginatedGrid;