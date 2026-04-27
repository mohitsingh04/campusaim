import { generateSlug } from "@/context/Callbacks";
import {
  DynamicFilterExamOptionsProps,
  ExamFilterProps,
} from "@/types/ExamFilterTypes";
import { ExamProps } from "@/types/Types";

export const matchesMultiWordSearch = (
  itemName: string,
  searchTerm: string,
): boolean => {
  if (!searchTerm.trim()) return true;

  const itemSlug = generateSlug(itemName);
  const searchSlug = generateSlug(searchTerm);

  const searchWords = searchSlug.split("-");

  return searchWords.every((word) => itemSlug.includes(word));
};

export const createDynamicFilterOptions = (
  allExams: ExamProps[],
  searchTerm: string = "",
  currentFilters: ExamFilterProps = {
    exam_mode: [],
  },
): DynamicFilterExamOptionsProps => {
  const getFilteredExamForCount = (
    excludeFilterType: keyof ExamFilterProps,
  ) => {
    return allExams.filter((exam) => {
      const matchesSearch = matchesMultiWordSearch(exam.exam_name, searchTerm);

      const filtersToApply = Object.entries(currentFilters).filter(
        ([key]) => key !== excludeFilterType,
      );

      return (
        filtersToApply.every(([filterType, filterValues]) => {
          if (!Array.isArray(filterValues) || filterValues.length === 0)
            return true;

          switch (filterType) {
            case "exam_mode":
              return (
                exam.exam_mode &&
                filterValues.some(
                  (cat) =>
                    generateSlug(exam.exam_mode || "") === generateSlug(cat),
                )
              );

            default:
              return true;
          }
        }) && matchesSearch
      );
    });
  };

  const filteredForCategories = getFilteredExamForCount("exam_mode");
  const allLevels = [
    ...new Set(
      filteredForCategories
        .map((exa) => exa.exam_mode)
        .filter((exam_mode): exam_mode is string =>
          Boolean(exam_mode && exam_mode.trim()),
        ),
    ),
  ];
  return {
    examMode: allLevels.map((exam_mode) => ({
      name: exam_mode,
      value: exam_mode,
      count: filteredForCategories.filter(
        (exa) => generateSlug(exa.exam_mode || "") === generateSlug(exam_mode),
      ).length,
    })),
  };
};

export const filterdExams = (
  allExams: ExamProps[],
  searchTerm: string,
  filters: ExamFilterProps,
): ExamProps[] => {
  return allExams.filter((exam) => {
    // Search term matching
    const matchesSearch = matchesMultiWordSearch(exam.exam_name, searchTerm);

    const matchesLevels =
      filters.exam_mode.length === 0 ||
      (exam.exam_mode &&
        filters.exam_mode.some(
          (cat) => generateSlug(exam.exam_mode || "") === generateSlug(cat),
        ));

    return matchesSearch && matchesLevels;
  });
};

export const getVisiblePageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | string)[] => {
  const maxVisiblePages = 5;
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      // Show first 5 pages
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Show last 5 pages
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return pages;
};
