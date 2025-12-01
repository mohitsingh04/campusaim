import { generateSlug } from "@/contexts/Callbacks";
import {
  DynamicFilterOptionsProps,
  FiltersProps,
  PropertyProps,
  ReviewProps,
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

// Helper function to calculate average rating
export const calculateAverageRating = (
  reviews: ReviewProps[] | undefined
): number => {
  if (!reviews || reviews.length === 0) return 0;

  const totalRating = reviews.reduce(
    (sum, review) => sum + (review.rating || 0),
    0
  );
  return totalRating / reviews.length;
};

// // Helper function to get rating range for a property
// const getRatingRange = (averageRating: number): number => {
//   if (averageRating >= 5) return 5;
//   if (averageRating >= 4) return 4;
//   if (averageRating >= 3) return 3;
//   if (averageRating >= 2) return 2;
//   if (averageRating >= 1) return 1;
//   return 0;
// };

export const createDynamicFilterOptions = (
  institutes: PropertyProps[],
  searchTerm: string = "",
  currentFilters: FiltersProps = {
    country: [],
    state: [],
    city: [],
    course_name: [],
    course_level: [],
    course_type: [],
    course_format: [],
    rating: [],
    category: [],
    property_type: [],
  }
): DynamicFilterOptionsProps => {
  // For location filters (country, state, city), use unfiltered data
  const countries = [
    ...new Set(
      institutes
        .map((inst) => inst.property_country)
        .filter((country): country is string =>
          Boolean(country && country.trim())
        )
    ),
  ];

  const getStatesForCountries = (
    selectedCountries: string[] = []
  ): string[] => {
    let filteredInstitutes = institutes;

    if (selectedCountries.length > 0) {
      filteredInstitutes = institutes.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.property_country || "") === generateSlug(selected)
        )
      );
    }

    return [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.property_state)
          .filter((state): state is string => Boolean(state && state.trim()))
      ),
    ];
  };

  const getCitiesForLocation = (
    selectedCountries: string[] = [],
    selectedStates: string[] = []
  ): string[] => {
    let filteredInstitutes = institutes;

    if (selectedCountries.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.property_country || "") === generateSlug(selected)
        )
      );
    }

    if (selectedStates.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedStates.some(
          (selected) =>
            generateSlug(inst.property_state || "") === generateSlug(selected)
        )
      );
    }

    return [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.property_city)
          .filter((city): city is string => Boolean(city && city.trim()))
      ),
    ];
  };

  // Helper function to get states with counts for selected countries
  const getStatesWithCounts = (selectedCountries: string[] = []) => {
    let filteredInstitutes = institutes;

    if (selectedCountries.length > 0) {
      filteredInstitutes = institutes.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.property_country || "") === generateSlug(selected)
        )
      );
    }

    const states = [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.property_state)
          .filter((state): state is string => Boolean(state && state.trim()))
      ),
    ];

    return states.map((state) => ({
      name: state,
      count: filteredInstitutes.filter(
        (inst) =>
          generateSlug(inst.property_state || "") === generateSlug(state)
      ).length,
    }));
  };

  // Helper function to get cities with counts for selected countries and states
  const getCitiesWithCounts = (
    selectedCountries: string[] = [],
    selectedStates: string[] = []
  ) => {
    let filteredInstitutes = institutes;

    if (selectedCountries.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.property_country || "") === generateSlug(selected)
        )
      );
    }

    if (selectedStates.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedStates.some(
          (selected) =>
            generateSlug(inst.property_state || "") === generateSlug(selected)
        )
      );
    }

    const cities = [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.property_city)
          .filter((city): city is string => Boolean(city && city.trim()))
      ),
    ];

    return cities.map((city) => ({
      name: city,
      count: filteredInstitutes.filter(
        (inst) => generateSlug(inst.property_city || "") === generateSlug(city)
      ).length,
    }));
  };

  // For other filters, use filtered data based on current filters (excluding the filter being calculated)
  const getFilteredInstitutesForCount = (
    excludeFilterType: keyof FiltersProps
  ) => {
    return institutes.filter((institute) => {
      // Apply search term
      const matchesSearch = matchesMultiWordSearch(
        institute.property_name,
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
            case "country":
              return (
                institute.property_country &&
                filterValues.some(
                  (c) =>
                    generateSlug(institute.property_country || "") ===
                    generateSlug(c)
                )
              );
            case "state":
              return (
                institute.property_state &&
                filterValues.some(
                  (s) =>
                    generateSlug(institute.property_state || "") ===
                    generateSlug(s)
                )
              );
            case "city":
              return (
                institute.property_city &&
                filterValues.some(
                  (c) =>
                    generateSlug(institute.property_city || "") ===
                    generateSlug(c)
                )
              );
            case "course_name":
              return filterValues.some((name) =>
                institute.courses.some(
                  (course) =>
                    generateSlug(course.course_name || "") ===
                    generateSlug(name)
                )
              );
            case "course_level":
              return filterValues.some((level) =>
                institute.courses.some(
                  (course) =>
                    generateSlug(course.course_level || "") ===
                    generateSlug(level)
                )
              );
            case "course_type":
              return filterValues.some((type) =>
                institute.courses.some(
                  (course) =>
                    generateSlug(course.course_type || "") ===
                    generateSlug(type)
                )
              );
            case "course_format":
              return filterValues.some((format) =>
                institute.courses.some(
                  (course) =>
                    generateSlug(course.course_format || "") ===
                    generateSlug(format)
                )
              );
            case "rating":
              const averageRating = calculateAverageRating(institute.reviews);
              return filterValues.some((rating) => {
                const selectedRating = parseFloat(rating);
                return (
                  averageRating >= selectedRating &&
                  averageRating < selectedRating + 1
                );
              });
            case "category":
              return (
                institute.category &&
                filterValues.some(
                  (cat) =>
                    generateSlug(institute.category || "") === generateSlug(cat)
                )
              );
            case "property_type":
              return (
                institute.property_type &&
                filterValues.some(
                  (type) =>
                    generateSlug(institute.property_type || "") ===
                    generateSlug(type)
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
  const filteredForCourseNames = getFilteredInstitutesForCount("course_name");
  const courseNames = [
    ...new Set(
      filteredForCourseNames.flatMap((inst) =>
        inst.courses
          .map((course) => course.course_name)
          .filter((name): name is string => Boolean(name && name.trim()))
      )
    ),
  ];

  const filteredForCourseLevels = getFilteredInstitutesForCount("course_level");
  const courseLevels = [
    ...new Set(
      filteredForCourseLevels.flatMap((inst) =>
        inst.courses
          .map((course) => course.course_level)
          .filter((level): level is string => Boolean(level && level.trim()))
      )
    ),
  ];

  const filteredForCourseTypes = getFilteredInstitutesForCount("course_type");
  const courseTypes = [
    ...new Set(
      filteredForCourseTypes.flatMap((inst) =>
        inst.courses
          .map((course) => course.course_type)
          .filter((type): type is string => Boolean(type && type.trim()))
      )
    ),
  ];

  const filteredForCourseFormats =
    getFilteredInstitutesForCount("course_format");
  const courseFormats = [
    ...new Set(
      filteredForCourseFormats.flatMap((inst) =>
        inst.courses
          .map((course) => course.course_format)
          .filter((format): format is string =>
            Boolean(format && format.trim())
          )
      )
    ),
  ];

  const filteredForCategories = getFilteredInstitutesForCount("category");
  const categories = [
    ...new Set(
      filteredForCategories
        .map((inst) => inst.category)
        .filter((category): category is string =>
          Boolean(category && category.trim())
        )
    ),
  ];

  const filteredForPropertyTypes =
    getFilteredInstitutesForCount("property_type");
  const propertyTypes = [
    ...new Set(
      filteredForPropertyTypes
        .map((inst) => inst.property_type)
        .filter((type): type is string => Boolean(type && type.trim()))
    ),
  ];

  // Calculate rating counts
  const filteredForRating = getFilteredInstitutesForCount("rating");
  const ratingCounts = [1, 2, 3, 4, 5].map((rating) => {
    const count = filteredForRating.filter((institute) => {
      const averageRating = calculateAverageRating(institute.reviews);
      return averageRating >= rating && averageRating < rating + 1;
    }).length;
    return { rating, count };
  });

  return {
    countries: countries.map((country) => ({
      name: country,
      // For location filters, always use unfiltered data count
      count: institutes.filter(
        (inst) =>
          generateSlug(inst.property_country || "") === generateSlug(country)
      ).length,
    })),
    getStatesForCountries,
    getCitiesForLocation,
    getStatesWithCounts,
    getCitiesWithCounts,
    courseNames: courseNames.map((name) => ({
      name: name,
      count: filteredForCourseNames.filter((inst) =>
        inst.courses.some(
          (course) =>
            generateSlug(course.course_name || "") === generateSlug(name)
        )
      ).length,
    })),
    courseLevels: courseLevels.map((level) => ({
      name: level,
      count: filteredForCourseLevels.filter((inst) =>
        inst.courses.some(
          (course) =>
            generateSlug(course.course_level || "") === generateSlug(level)
        )
      ).length,
    })),
    courseTypes: courseTypes.map((type) => ({
      name: type,
      count: filteredForCourseTypes.filter((inst) =>
        inst.courses.some(
          (course) =>
            generateSlug(course.course_type || "") === generateSlug(type)
        )
      ).length,
    })),
    courseFormats: courseFormats.map((format) => ({
      name: format,
      count: filteredForCourseFormats.filter((inst) =>
        inst.courses.some(
          (course) =>
            generateSlug(course.course_format || "") === generateSlug(format)
        )
      ).length,
    })),
    categories: categories.map((category) => ({
      name: category,
      value: category,
      count: filteredForCategories.filter(
        (inst) => generateSlug(inst.category || "") === generateSlug(category)
      ).length,
    })),
    propertyTypes: propertyTypes.map((type) => ({
      name: type,
      value: type,
      count: filteredForPropertyTypes.filter(
        (inst) => generateSlug(inst.property_type || "") === generateSlug(type)
      ).length,
    })),
    ratingCounts,
  };
};

export const filterInstitutes = (
  institutes: PropertyProps[],
  searchTerm: string,
  filters: FiltersProps
): PropertyProps[] => {
  return institutes.filter((institute) => {
    // Search term matching
    const matchesSearch = matchesMultiWordSearch(
      institute.property_name,
      searchTerm
    );

    const matchesCountry =
      filters.country.length === 0 ||
      (institute.property_country &&
        filters.country.some(
          (c) =>
            generateSlug(institute.property_country || "") === generateSlug(c)
        ));

    const matchesState =
      filters.state.length === 0 ||
      (institute.property_state &&
        filters.state.some(
          (s) =>
            generateSlug(institute.property_state || "") === generateSlug(s)
        ));

    const matchesCity =
      filters.city.length === 0 ||
      (institute.property_city &&
        filters.city.some(
          (c) => generateSlug(institute.property_city || "") === generateSlug(c)
        ));

    const matchesCourseName =
      filters.course_name.length === 0 ||
      filters.course_name.some((name) =>
        institute.courses.some(
          (course) =>
            generateSlug(course.course_name || "") === generateSlug(name)
        )
      );

    const matchesCourseLevel =
      filters.course_level.length === 0 ||
      filters.course_level.some((level) =>
        institute.courses.some(
          (course) =>
            generateSlug(course.course_level || "") === generateSlug(level)
        )
      );

    const matchesCourseType =
      filters.course_type.length === 0 ||
      filters.course_type.some((type) =>
        institute.courses.some(
          (course) =>
            generateSlug(course.course_type || "") === generateSlug(type)
        )
      );

    const matchesCourseFormat =
      filters.course_format.length === 0 ||
      filters.course_format.some((format) =>
        institute.courses.some(
          (course) =>
            generateSlug(course.course_format || "") === generateSlug(format)
        )
      );

    // Fixed rating filter - now uses overall average rating
    const averageRating = calculateAverageRating(institute.reviews);
    const matchesRating =
      filters.rating.length === 0 ||
      filters.rating.some((rating) => {
        const selectedRating = parseFloat(rating);
        // Show properties with average rating >= selected rating and < selected rating + 1
        // For example, if 3 is selected, show properties with rating 3.0 to 3.99
        return (
          averageRating >= selectedRating && averageRating < selectedRating + 1
        );
      });

    const matchesCategory =
      filters.category.length === 0 ||
      (institute.category &&
        filters.category.some(
          (cat) => generateSlug(institute.category || "") === generateSlug(cat)
        ));

    const matchesPropertyType =
      filters.property_type.length === 0 ||
      (institute.property_type &&
        filters.property_type.some(
          (type) =>
            generateSlug(institute.property_type || "") === generateSlug(type)
        ));

    return (
      matchesSearch &&
      matchesCountry &&
      matchesState &&
      matchesCity &&
      matchesCourseName &&
      matchesCourseLevel &&
      matchesCourseType &&
      matchesCourseFormat &&
      matchesRating &&
      matchesCategory &&
      matchesPropertyType
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
