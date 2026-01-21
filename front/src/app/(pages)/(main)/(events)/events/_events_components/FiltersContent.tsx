import { FaFilter } from "react-icons/fa";
import FilterSection from "./FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import {
  DynamicFilterEventOptionsProps,
  eventFilterProps,
  ExpandedEventFiltersProps,
  FilterEventSearchTermsProps,
} from "@/types/EventFilterTypes";

interface FiltersContentProps {
  dynamicFilterOptions: DynamicFilterEventOptionsProps;
  filters: eventFilterProps;
  filterSearchTerms: FilterEventSearchTermsProps;
  expandedFilters: ExpandedEventFiltersProps;
  onToggleFilter: (filterType: keyof ExpandedEventFiltersProps) => void;
  onCheckboxFilter: (filterType: keyof eventFilterProps, value: string) => void;
  onFilterSearchChange: (
    filterType: keyof FilterEventSearchTermsProps,
    value: string
  ) => void;
  onClearAll: () => void;
}
const FiltersContent = ({
  dynamicFilterOptions,
  filters,
  filterSearchTerms,
  expandedFilters,
  onToggleFilter,
  onCheckboxFilter,
  onFilterSearchChange,
  onClearAll,
}: FiltersContentProps) => {
  const availableStates = dynamicFilterOptions.getStatesWithCounts(
    filters.event_country
  );

  // Get cities with proper counts from unfiltered data
  const availableCities = dynamicFilterOptions.getCitiesWithCounts(
    filters.event_country,
    filters.event_state
  );
  return (
    <div>
      <div className="hidden md:flex items-center justify-between bg-(--primary-bg) sticky top-0 z-20 w-full h-12 px-3">
        <span className="font-semibold flex items-center text-(--text-color-emphasis)">
          <FaFilter className="w-4 h-4 mr-2 text-(--main)" /> Filters
        </span>

        <button
          onClick={onClearAll}
          className="text-(--main) hover:underline font-medium flex items-center cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <div className="p-5">
        {dynamicFilterOptions.entranceTypes.length > 0 && (
          <FilterSection
            title="Entrance Type"
            isExpanded={expandedFilters.entrance_type}
            onToggle={() => onToggleFilter("entrance_type")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.entranceTypes}
              filterType="entrance_type"
              selectedItems={filters.entrance_type}
              searchTerm={filterSearchTerms.entrance_type}
              onSearchChange={(value) =>
                onFilterSearchChange("entrance_type", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}
        {dynamicFilterOptions.calendarGroups.length > 0 && (
          <FilterSection
            title="Calendar"
            isExpanded={expandedFilters.calendar_group}
            onToggle={() => onToggleFilter("calendar_group")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.calendarGroups}
              filterType="calendar_group"
              selectedItems={filters.calendar_group}
              searchTerm={filterSearchTerms.calendar_group}
              onSearchChange={(value) =>
                onFilterSearchChange("calendar_group", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {dynamicFilterOptions.countries.length > 0 && (
          <FilterSection
            title="Country"
            isExpanded={expandedFilters.event_country}
            onToggle={() => onToggleFilter("event_country")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.countries}
              filterType="event_country"
              selectedItems={filters.event_country}
              searchTerm={filterSearchTerms.event_country}
              onSearchChange={(value) =>
                onFilterSearchChange("event_country", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {filters.event_country.length > 0 && availableStates.length > 0 && (
          <FilterSection
            title="State"
            isExpanded={expandedFilters.event_state}
            onToggle={() => onToggleFilter("event_state")}
          >
            <CheckboxFilter
              items={availableStates}
              filterType="event_state"
              selectedItems={filters.event_state}
              searchTerm={filterSearchTerms.event_state}
              onSearchChange={(value) =>
                onFilterSearchChange("event_state", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {filters.event_state.length > 0 && availableCities.length > 0 && (
          <FilterSection
            title="City"
            isExpanded={expandedFilters.event_city}
            onToggle={() => onToggleFilter("event_city")}
          >
            <CheckboxFilter
              items={availableCities}
              filterType="event_city"
              selectedItems={filters.event_city}
              searchTerm={filterSearchTerms.event_city}
              onSearchChange={(value) =>
                onFilterSearchChange("event_city", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}
      </div>
    </div>
  );
};

export default FiltersContent;
