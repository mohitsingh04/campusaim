import { generateSlug } from "@/context/Callbacks";
import {
  DynamicFilterEventOptionsProps,
  eventFilterProps,
} from "@/types/EventFilterTypes";
import { EventProps } from "@/types/Types";

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
  allEvents: EventProps[],
  searchTerm: string = "",
  currentFilters: eventFilterProps = {
    entrance_type: [],
    calendar_group: [],
    event_city: [],
    event_country: [],
    event_state: [],
  }
): DynamicFilterEventOptionsProps => {
  const countries = [
    ...new Set(
      allEvents
        .map((inst) => inst.event_country)
        .filter((country): country is string =>
          Boolean(country && country.trim())
        )
    ),
  ];
  const getStatesForCountries = (
    selectedCountries: string[] = []
  ): string[] => {
    let filteredInstitutes = allEvents;

    if (selectedCountries.length > 0) {
      filteredInstitutes = allEvents.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.event_country || "") === generateSlug(selected)
        )
      );
    }

    return [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.event_state)
          .filter((state): state is string => Boolean(state && state.trim()))
      ),
    ];
  };

  const getCitiesForLocation = (
    selectedCountries: string[] = [],
    selectedStates: string[] = []
  ): string[] => {
    let filteredInstitutes = allEvents;

    if (selectedCountries.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.event_country || "") === generateSlug(selected)
        )
      );
    }

    if (selectedStates.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedStates.some(
          (selected) =>
            generateSlug(inst.event_state || "") === generateSlug(selected)
        )
      );
    }

    return [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.event_city)
          .filter((city): city is string => Boolean(city && city.trim()))
      ),
    ];
  };

  // Helper function to get states with counts for selected countries
  const getStatesWithCounts = (selectedCountries: string[] = []) => {
    let filteredInstitutes = allEvents;

    if (selectedCountries.length > 0) {
      filteredInstitutes = allEvents.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.event_country || "") === generateSlug(selected)
        )
      );
    }

    const states = [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.event_state)
          .filter((state): state is string => Boolean(state && state.trim()))
      ),
    ];

    return states.map((state) => ({
      name: state,
      count: filteredInstitutes.filter(
        (inst) => generateSlug(inst.event_state || "") === generateSlug(state)
      ).length,
    }));
  };

  // Helper function to get cities with counts for selected countries and states
  const getCitiesWithCounts = (
    selectedCountries: string[] = [],
    selectedStates: string[] = []
  ) => {
    let filteredInstitutes = allEvents;

    if (selectedCountries.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedCountries.some(
          (selected) =>
            generateSlug(inst.event_country || "") === generateSlug(selected)
        )
      );
    }

    if (selectedStates.length > 0) {
      filteredInstitutes = filteredInstitutes.filter((inst) =>
        selectedStates.some(
          (selected) =>
            generateSlug(inst.event_state || "") === generateSlug(selected)
        )
      );
    }

    const cities = [
      ...new Set(
        filteredInstitutes
          .map((inst) => inst.event_city)
          .filter((city): city is string => Boolean(city && city.trim()))
      ),
    ];

    return cities.map((city) => ({
      name: city,
      count: filteredInstitutes.filter(
        (inst) => generateSlug(inst.event_city || "") === generateSlug(city)
      ).length,
    }));
  };

  const getFilteredEventForCount = (
    excludeFilterType: keyof eventFilterProps
  ) => {
    return allEvents.filter((ev) => {
      // Apply search term
      const matchesSearch = matchesMultiWordSearch(ev.title, searchTerm);

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
                ev.event_country &&
                filterValues.some(
                  (c) =>
                    generateSlug(ev.event_country || "") === generateSlug(c)
                )
              );
            case "state":
              return (
                ev.event_state &&
                filterValues.some(
                  (s) => generateSlug(ev.event_state || "") === generateSlug(s)
                )
              );
            case "city":
              return (
                ev.event_city &&
                filterValues.some(
                  (c) => generateSlug(ev.event_city || "") === generateSlug(c)
                )
              );
            case "entrance_type":
              return (
                ev.entrance_type &&
                filterValues.some(
                  (cat) =>
                    generateSlug(ev.entrance_type || "") === generateSlug(cat)
                )
              );
            case "calendar_group":
              return (
                ev.calendar_group &&
                filterValues.some(
                  (cat) =>
                    generateSlug(ev.calendar_group || "") === generateSlug(cat)
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

  const filteredForCategories = getFilteredEventForCount("entrance_type");
  const allentrancetypes = [
    ...new Set(
      filteredForCategories
        .map((even) => even.entrance_type)
        .filter((entrance_type): entrance_type is string =>
          Boolean(entrance_type && entrance_type.trim())
        )
    ),
  ];
  const filteredForCalendar = getFilteredEventForCount("calendar_group");
  const allCalenderGroup = [
    ...new Set(
      filteredForCategories
        .map((even) => even.calendar_group)
        .filter((calendar_group): calendar_group is string =>
          Boolean(calendar_group && calendar_group.trim())
        )
    ),
  ];

  return {
    countries: countries.map((country) => ({
      name: country,
      // For location filters, always use unfiltered data count
      count: allEvents.filter(
        (inst) =>
          generateSlug(inst.event_country || "") === generateSlug(country)
      ).length,
    })),
    getStatesForCountries,
    getCitiesForLocation,
    getStatesWithCounts,
    getCitiesWithCounts,
    entranceTypes: allentrancetypes.map((entrance_type) => ({
      name: entrance_type,
      value: entrance_type,
      count: filteredForCategories.filter(
        (even) =>
          generateSlug(even.entrance_type || "") === generateSlug(entrance_type)
      ).length,
    })),
    calendarGroups: allCalenderGroup.map((calendar_group) => ({
      name: calendar_group,
      value: calendar_group,
      count: filteredForCalendar.filter(
        (even) =>
          generateSlug(even.calendar_group || "") ===
          generateSlug(calendar_group)
      ).length,
    })),
  };
};

export const filterdEvents = (
  allEvents: EventProps[],
  searchTerm: string,
  filters: eventFilterProps
): EventProps[] => {
  return allEvents.filter((ev) => {
    // Search term matching
    const matchesSearch = matchesMultiWordSearch(ev.title, searchTerm);
    const matchesCountry =
      filters.event_country.length === 0 ||
      (ev.event_country &&
        filters.event_country.some(
          (c) => generateSlug(ev.event_country || "") === generateSlug(c)
        ));

    const matchesState =
      filters.event_state.length === 0 ||
      (ev.event_state &&
        filters.event_state.some(
          (s) => generateSlug(ev.event_state || "") === generateSlug(s)
        ));

    const matchesCity =
      filters.event_city.length === 0 ||
      (ev?.event_city &&
        filters.event_city.some(
          (c) => generateSlug(ev?.event_city || "") === generateSlug(c)
        ));
    const matchesEntranceTypes =
      filters.entrance_type.length === 0 ||
      (ev.entrance_type &&
        filters.entrance_type.some(
          (cat) => generateSlug(ev.entrance_type || "") === generateSlug(cat)
        ));
    const matchesCalendar =
      filters?.calendar_group?.length === 0 ||
      (ev.calendar_group &&
        filters?.calendar_group?.some(
          (cat) => generateSlug(ev.calendar_group || "") === generateSlug(cat)
        ));

    return (
      matchesSearch &&
      matchesCountry &&
      matchesState &&
      matchesCity &&
      matchesEntranceTypes &&
      matchesCalendar
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
