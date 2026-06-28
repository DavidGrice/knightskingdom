import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

const usePaginatedGrid = ({
  items,
  itemsPerPage,
  arrows,
  resetToken = false,
  onReset,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItem(null);
    onResetRef.current?.();
  }, [resetToken]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const displayedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const downArrowImage = useMemo(() => {
    if (items.length > itemsPerPage && items.length % itemsPerPage !== 0) {
      return currentPage === totalPages ? arrows.downSolid : arrows.downGreen;
    }
    return arrows.downSolid;
  }, [
    items.length,
    itemsPerPage,
    currentPage,
    totalPages,
    arrows.downSolid,
    arrows.downGreen,
  ]);

  const upArrowImage = useMemo(() => (
    currentPage === 1 ? arrows.upSolid : arrows.upGreen
  ), [currentPage, arrows.upSolid, arrows.upGreen]);

  const handleDownArrowClick = useCallback(() => {
    setCurrentPage((page) => (page < totalPages ? page + 1 : page));
  }, [totalPages]);

  const handleUpArrowClick = useCallback(() => {
    setCurrentPage((page) => (page > 1 ? page - 1 : page));
  }, []);

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