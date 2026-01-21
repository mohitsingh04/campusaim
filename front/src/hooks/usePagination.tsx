'use client';

import { useMemo } from 'react';

export const DOTS = '...';

const range = (start: number, end: number): number[] => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => i + start);
};

type UsePaginationProps = {
  totalPages: number;
  currentPage: number;
  siblingCount?: number; // optional: number of pages to show around current page
};

export const usePagination = ({
  totalPages,
  currentPage,
  siblingCount = 1,
}: UsePaginationProps): (number | string)[] => {
  return useMemo(() => {
    // If there are no pages, return empty
    if (totalPages <= 0) return [];

    // Total visible page items = current + siblings + first + last + dots
    const totalPageNumbers = 4 + 2 * siblingCount;

    // Case 1: All pages fit without dots
    if (totalPageNumbers >= totalPages) {
      return range(1, totalPages);
    }

    // Calculate sibling bounds
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = range(1, 2 + 2 * siblingCount);
      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: Left dots, but no right dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = range(totalPages - (2 + 2 * siblingCount), totalPages);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    // Fallback (should not hit normally)
    return range(1, totalPages);
  }, [totalPages, currentPage, siblingCount]);
};
