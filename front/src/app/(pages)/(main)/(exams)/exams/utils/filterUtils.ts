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
    exam_type: [],
    exam_tag: [],
    upcoming_exam_month: [],
    result_month: [],
    application_month: [],
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
            case "exam_type":
              return (
                exam.exam_type &&
                filterValues.some(
                  (cat) =>
                    generateSlug(exam.exam_type || "") === generateSlug(cat),
                )
              );
            case "exam_tag":
              return (
                Array.isArray(exam.exam_tag) &&
                exam.exam_tag.some((tag) =>
                  filterValues.some(
                    (cat) => generateSlug(tag) === generateSlug(cat),
                  ),
                )
              );
            case "upcoming_exam_month":
              return (
                exam.upcoming_exam_month &&
                filterValues.some(
                  (cat) =>
                    generateSlug(exam.upcoming_exam_month || "") ===
                    generateSlug(cat),
                )
              );
            case "result_month":
              return (
                exam.result_month &&
                filterValues.some(
                  (cat) =>
                    generateSlug(exam.result_month || "") === generateSlug(cat),
                )
              );
            case "application_month":
              return (
                exam.application_month &&
                filterValues.some(
                  (cat) =>
                    generateSlug(exam.application_month || "") ===
                    generateSlug(cat),
                )
              );

            default:
              return true;
          }
        }) && matchesSearch
      );
    });
  };

  const filteredForModes = getFilteredExamForCount("exam_mode");
  const allModes = [
    ...new Set(
      filteredForModes
        .map((exa) => exa.exam_mode)
        .filter((exam_mode): exam_mode is string =>
          Boolean(exam_mode && exam_mode.trim()),
        ),
    ),
  ];
  const filteredForExamTypes = getFilteredExamForCount("exam_type");
  const allTypes = [
    ...new Set(
      filteredForExamTypes
        .map((exa) => exa.exam_type)
        .filter((exam_type): exam_type is string =>
          Boolean(exam_type && exam_type.trim()),
        ),
    ),
  ];
  const filteredForUpcomingMonth = getFilteredExamForCount(
    "upcoming_exam_month",
  );
  const allUpcomingMonth = [
    ...new Set(
      filteredForUpcomingMonth
        .map((exa) => exa.upcoming_exam_month)
        .filter((upcoming_exam_month): upcoming_exam_month is string =>
          Boolean(upcoming_exam_month && upcoming_exam_month.trim()),
        ),
    ),
  ];
  const filteredForResultMonth = getFilteredExamForCount("result_month");
  const allResultMonth = [
    ...new Set(
      filteredForResultMonth
        .map((exa) => exa.result_month)
        .filter((result_month): result_month is string =>
          Boolean(result_month && result_month.trim()),
        ),
    ),
  ];
  const filteredForApplicationMonth =
    getFilteredExamForCount("application_month");
  const allApplicationMonth = [
    ...new Set(
      filteredForApplicationMonth
        .map((exa) => exa.application_month)
        .filter((application_month): application_month is string =>
          Boolean(application_month && application_month.trim()),
        ),
    ),
  ];
  const filteredForExamTags = getFilteredExamForCount("exam_tag");

  const allExamTags = [
    ...new Set(
      filteredForExamTags
        .flatMap((exa) => exa.exam_tag || [])
        .filter((exam_tag): exam_tag is string =>
          Boolean(exam_tag && exam_tag.trim()),
        ),
    ),
  ];
  return {
    examMode: allModes.map((exam_mode) => ({
      name: exam_mode,
      value: exam_mode,
      count: filteredForModes.filter(
        (exa) => generateSlug(exa.exam_mode || "") === generateSlug(exam_mode),
      ).length,
    })),
    examType: allTypes.map((exam_type) => ({
      name: exam_type,
      value: exam_type,
      count: filteredForModes.filter(
        (exa) => generateSlug(exa.exam_type || "") === generateSlug(exam_type),
      ).length,
    })),
    examTag: allExamTags.map((exam_tag) => ({
      name: exam_tag,
      value: exam_tag,
      count: filteredForModes.filter(
        (exa) =>
          Array.isArray(exa.exam_tag) &&
          exa.exam_tag.some(
            (tag) => generateSlug(tag) === generateSlug(exam_tag),
          ),
      ).length,
    })),
    upcomingExamMonths: allUpcomingMonth.map((upcoming_exam_month) => ({
      name: upcoming_exam_month,
      value: upcoming_exam_month,
      count: filteredForModes.filter(
        (exa) =>
          generateSlug(exa.upcoming_exam_month || "") ===
          generateSlug(upcoming_exam_month),
      ).length,
    })),
    resultMonths: allResultMonth.map((result_month) => ({
      name: result_month,
      value: result_month,
      count: filteredForModes.filter(
        (exa) =>
          generateSlug(exa.result_month || "") === generateSlug(result_month),
      ).length,
    })),
    applicationMonth: allApplicationMonth.map((application_month) => ({
      name: application_month,
      value: application_month,
      count: filteredForModes.filter(
        (exa) =>
          generateSlug(exa.application_month || "") ===
          generateSlug(application_month),
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
    const matchesSearch = matchesMultiWordSearch(exam.exam_name, searchTerm);

    const matchesLevels =
      filters.exam_mode.length === 0 ||
      (exam.exam_mode &&
        filters.exam_mode.some(
          (cat) => generateSlug(exam.exam_mode || "") === generateSlug(cat),
        ));
    const matchesTypes =
      filters.exam_type.length === 0 ||
      (exam.exam_type &&
        filters.exam_type.some(
          (cat) => generateSlug(exam.exam_type || "") === generateSlug(cat),
        ));
    const matchesUpcomingMonth =
      filters.upcoming_exam_month.length === 0 ||
      (exam.upcoming_exam_month &&
        filters.upcoming_exam_month.some(
          (cat) =>
            generateSlug(exam.upcoming_exam_month || "") === generateSlug(cat),
        ));
    const matchesResultMonth =
      filters.result_month.length === 0 ||
      (exam.result_month &&
        filters.result_month.some(
          (cat) => generateSlug(exam.result_month || "") === generateSlug(cat),
        ));
    const matchesApplicationMonth =
      filters.application_month.length === 0 ||
      (exam.application_month &&
        filters.application_month.some(
          (cat) =>
            generateSlug(exam.application_month || "") === generateSlug(cat),
        ));
    const matchesTags =
      filters.exam_tag.length === 0 ||
      (Array.isArray(exam.exam_tag) &&
        filters.exam_tag.some((cat) =>
          exam.exam_tag.some((tag) => generateSlug(tag) === generateSlug(cat)),
        ));

    return (
      matchesSearch &&
      matchesLevels &&
      matchesTypes &&
      matchesTags &&
      matchesUpcomingMonth &&
      matchesResultMonth &&
      matchesApplicationMonth
    );
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
