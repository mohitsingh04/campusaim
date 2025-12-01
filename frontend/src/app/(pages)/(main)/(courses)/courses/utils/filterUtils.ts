import { generateSlug } from "@/contexts/Callbacks";
import {
  DynamicFilterCourseOptionsProps,
  courseFilterProps,
  CourseProps,
} from "@/types/types";

export const matchesMultiWordSearch = (
  itemName: string,
  searchTerm: string
): boolean => {
  if (!searchTerm.trim()) return true;

  const itemSlug = generateSlug(itemName);
  const searchSlug = generateSlug(searchTerm);

  const searchWords = searchSlug.split("-");

  return searchWords.every((word) => itemSlug.includes(word));
};

export const createDynamicFilterOptions = (
  allCourses: CourseProps[],
  searchTerm: string = "",
  currentFilters: courseFilterProps = {
    course_level: [],
    course_type: [],
    certification_type: [],
    duration: [],
  }
): DynamicFilterCourseOptionsProps => {
  const getFilteredCoursesForCount = (
    excludeFilterType: keyof courseFilterProps
  ) => {
    return allCourses.filter((course) => {
      // Apply search term
      const matchesSearch = matchesMultiWordSearch(
        course.course_name,
        searchTerm
      );

      // Apply all filters except the one we're calculating counts for
      const filtersToApply = Object.entries(currentFilters).filter(
        ([key]) => key !== excludeFilterType
      );

      return (
        filtersToApply.every(([filterType, filterValues]) => {
          if (!Array.isArray(filterValues) || filterValues.length === 0)
            return true;

          switch (filterType) {
            case "course_level":
              return (
                course.course_level &&
                filterValues.some(
                  (cat) =>
                    generateSlug(course.course_level || "") ===
                    generateSlug(cat)
                )
              );
            case "course_type":
              return (
                course.course_type &&
                filterValues.some(
                  (cat) =>
                    generateSlug(course.course_type || "") === generateSlug(cat)
                )
              );
            case "certification_type":
              return (
                course.certification_type &&
                filterValues.some(
                  (cat) =>
                    generateSlug(course.certification_type || "") ===
                    generateSlug(cat)
                )
              );
            case "duration":
              return (
                course.duration &&
                filterValues.some(
                  (cat) =>
                    generateSlug(course.duration || "") === generateSlug(cat)
                )
              );

            default:
              return true;
          }
        }) && matchesSearch
      );
    });
  };

  // Get unique values for non-location filters

  const filteredForCategories = getFilteredCoursesForCount("course_level");
  const allLevels = [
    ...new Set(
      filteredForCategories
        .map((inst) => inst.course_level)
        .filter((course_level): course_level is string =>
          Boolean(course_level && course_level.trim())
        )
    ),
  ];
  const filteredForTypes = getFilteredCoursesForCount("course_level");
  const allTypes = [
    ...new Set(
      filteredForTypes
        .map((inst) => inst.course_type)
        .filter((course_type): course_type is string =>
          Boolean(course_type && course_type.trim())
        )
    ),
  ];
  const filteredForCertiType = getFilteredCoursesForCount("course_level");
  const allCertiTypes = [
    ...new Set(
      filteredForCertiType
        .map((inst) => inst.certification_type)
        .filter((certification_type): certification_type is string =>
          Boolean(certification_type && certification_type.trim())
        )
    ),
  ];
  const filteredForDuration = getFilteredCoursesForCount("course_level");
  const allDuration = [
    ...new Set(
      filteredForDuration
        .map((inst) => inst.duration)
        .filter((duration): duration is string =>
          Boolean(duration && duration.trim())
        )
    ),
  ];

  return {
    courseLevels: allLevels.map((course_level) => ({
      name: course_level,
      value: course_level,
      count: filteredForCategories.filter(
        (inst) =>
          generateSlug(inst.course_level || "") === generateSlug(course_level)
      ).length,
    })),
    courseTypes: allTypes.map((course_type) => ({
      name: course_type,
      value: course_type,
      count: filteredForCategories.filter(
        (inst) =>
          generateSlug(inst.course_type || "") === generateSlug(course_type)
      ).length,
    })),
    certificationType: allCertiTypes.map((certification_type) => ({
      name: certification_type,
      value: certification_type,
      count: filteredForCategories.filter(
        (inst) =>
          generateSlug(inst.certification_type || "") ===
          generateSlug(certification_type)
      ).length,
    })),
    durationsLists: allDuration.map((duration) => ({
      name: duration,
      value: duration,
      count: filteredForDuration.filter(
        (inst) => generateSlug(inst.duration || "") === generateSlug(duration)
      ).length,
    })),
  };
};

export const filterdCourses = (
  allCourses: CourseProps[],
  searchTerm: string,
  filters: courseFilterProps
): CourseProps[] => {
  return allCourses.filter((course) => {
    // Search term matching
    const matchesSearch = matchesMultiWordSearch(
      course.course_name,
      searchTerm
    );

    const matchesLevels =
      filters.course_level.length === 0 ||
      (course.course_level &&
        filters.course_level.some(
          (cat) => generateSlug(course.course_level || "") === generateSlug(cat)
        ));
    const matchesTypes =
      filters.course_type.length === 0 ||
      (course.course_type &&
        filters.course_type.some(
          (cat) => generateSlug(course.course_type || "") === generateSlug(cat)
        ));
    const matchesCertiTypes =
      filters.certification_type.length === 0 ||
      (course.certification_type &&
        filters.certification_type.some(
          (cat) =>
            generateSlug(course.certification_type || "") === generateSlug(cat)
        ));
    const matchesDurations =
      filters.duration.length === 0 ||
      (course.duration &&
        filters.duration.some(
          (cat) => generateSlug(course.duration || "") === generateSlug(cat)
        ));

    return (
      matchesSearch &&
      matchesLevels &&
      matchesTypes &&
      matchesCertiTypes &&
      matchesDurations
    );
  });
};

export const getVisiblePageNumbers = (
  currentPage: number,
  totalPages: number
): (number | string)[] => {
  const maxVisiblePages = 5;
  const pages: (number | string)[] = [];

  if (totalPages <= maxVisiblePages) {
    // Show all pages if total is less than or equal to max visible
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
