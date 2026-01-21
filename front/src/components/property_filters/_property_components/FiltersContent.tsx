import { FaFilter } from "react-icons/fa";
import FilterSection from "./FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import { LuStar } from "react-icons/lu";
import {
  DynamicFilterOptionsProps,
  ExpandedFiltersProps,
  FilterSearchTermsProps,
  FiltersProps,
} from "@/types/PropertyFilterTypes";

interface FiltersContentProps {
  dynamicFilterOptions: DynamicFilterOptionsProps;
  filters: FiltersProps;
  filterSearchTerms: FilterSearchTermsProps;
  expandedFilters: ExpandedFiltersProps;
  onToggleFilter: (filterType: keyof ExpandedFiltersProps) => void;
  onCheckboxFilter: (filterType: keyof FiltersProps, value: string) => void;
  onFilterSearchChange: (
    filterType: keyof FilterSearchTermsProps,
    value: string
  ) => void;
  onClearAll: () => void;
}

const RatingFilter = ({
  ratingOptions,
  selectedRatings,
  onCheckboxFilter,
}: {
  ratingOptions: { name: string; value: string; count: number }[];
  selectedRatings: string[];
  onCheckboxFilter: (filterType: keyof FiltersProps, value: string) => void;
}) => (
  <div className="space-y-2">
    {ratingOptions
      .filter((option) => option.count > 0)
      .map((option) => (
        <label
          key={option.value}
          className="flex items-center justify-between cursor-pointer group hover:bg-(--secondary-bg) p-1 rounded transition-colors"
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedRatings.includes(option.value)}
              onChange={() => onCheckboxFilter("rating", option.value)}
              className="w-3 h-3 cursor-pointer"
            />
            <div className="ml-2 flex items-center">
              <div className="flex">
                {[...Array(Number(option.value))].map((_, i) => (
                  <LuStar
                    key={i}
                    className="w-4 h-4 text-(--warning) fill-current"
                  />
                ))}
                {[...Array(5 - Number(option.value))].map((_, i) => (
                  <LuStar
                    key={i + Number(option.value)}
                    className="w-4 h-4 text-(--text-color)"
                  />
                ))}
              </div>
              <span className="ml-2 paragraph group-hover:text-(--main) transition-colors cursor-pointer">
                {option.name}
              </span>
            </div>
          </div>

          <span className="text-xs">({option.count})</span>
        </label>
      ))}
  </div>
);
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
    filters.country
  );

  // Get cities with proper counts from unfiltered data
  const availableCities = dynamicFilterOptions.getCitiesWithCounts(
    filters.country,
    filters.state
  );

  // Rating options with counts from dynamic filter options
  const ratingOptions = [
    {
      name: "5 Stars",
      value: "5",
      count:
        dynamicFilterOptions.ratingCounts.find((r) => r.rating === 5)?.count ||
        0,
    },
    {
      name: "4 Stars",
      value: "4",
      count:
        dynamicFilterOptions.ratingCounts.find((r) => r.rating === 4)?.count ||
        0,
    },
    {
      name: "3 Stars",
      value: "3",
      count:
        dynamicFilterOptions.ratingCounts.find((r) => r.rating === 3)?.count ||
        0,
    },
    {
      name: "2 Stars",
      value: "2",
      count:
        dynamicFilterOptions.ratingCounts.find((r) => r.rating === 2)?.count ||
        0,
    },
    {
      name: "1 Star",
      value: "1",
      count:
        dynamicFilterOptions.ratingCounts.find((r) => r.rating === 1)?.count ||
        0,
    },
  ];
  // ✅ Move to top (above FiltersContent)

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
        {dynamicFilterOptions.countries.length > 0 && (
          <FilterSection
            title="Country"
            isExpanded={expandedFilters.country}
            onToggle={() => onToggleFilter("country")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.countries}
              filterType="country"
              selectedItems={filters.country}
              searchTerm={filterSearchTerms.country}
              onSearchChange={(value) => onFilterSearchChange("country", value)}
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {filters.country.length > 0 && availableStates.length > 0 && (
          <FilterSection
            title="State"
            isExpanded={expandedFilters.state}
            onToggle={() => onToggleFilter("state")}
          >
            <CheckboxFilter
              items={availableStates}
              filterType="state"
              selectedItems={filters.state}
              searchTerm={filterSearchTerms.state}
              onSearchChange={(value) => onFilterSearchChange("state", value)}
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {filters.state.length > 0 && availableCities.length > 0 && (
          <FilterSection
            title="City"
            isExpanded={expandedFilters.city}
            onToggle={() => onToggleFilter("city")}
          >
            <CheckboxFilter
              items={availableCities}
              filterType="city"
              selectedItems={filters.city}
              searchTerm={filterSearchTerms.city}
              onSearchChange={(value) => onFilterSearchChange("city", value)}
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {dynamicFilterOptions.courseLevels.length > 0 && (
          <FilterSection
            title="Course Level"
            isExpanded={expandedFilters.course_level}
            onToggle={() => onToggleFilter("course_level")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.courseLevels}
              filterType="course_level"
              selectedItems={filters.course_level}
              searchTerm={filterSearchTerms.course_level}
              onSearchChange={(value) =>
                onFilterSearchChange("course_level", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {dynamicFilterOptions.courseTypes.length > 0 && (
          <FilterSection
            title="Course Type"
            isExpanded={expandedFilters.course_type}
            onToggle={() => onToggleFilter("course_type")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.courseTypes}
              filterType="course_type"
              selectedItems={filters.course_type}
              searchTerm={filterSearchTerms.course_type}
              onSearchChange={(value) =>
                onFilterSearchChange("course_type", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {dynamicFilterOptions.courseFormats.length > 0 && (
          <FilterSection
            title="Course Format"
            isExpanded={expandedFilters.course_format}
            onToggle={() => onToggleFilter("course_format")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.courseFormats}
              filterType="course_format"
              selectedItems={filters.course_format}
              searchTerm={filterSearchTerms.course_format}
              onSearchChange={(value) =>
                onFilterSearchChange("course_format", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {/* Rating Filter */}
        <FilterSection
          title="Overall Rating"
          isExpanded={expandedFilters.rating}
          onToggle={() => onToggleFilter("rating")}
        >
          <RatingFilter
            ratingOptions={ratingOptions}
            selectedRatings={filters.rating}
            onCheckboxFilter={onCheckboxFilter}
          />
        </FilterSection>

        {/* Category Filter */}
        {dynamicFilterOptions.categories.length > 0 && (
          <FilterSection
            title="Category"
            isExpanded={expandedFilters.category}
            onToggle={() => onToggleFilter("category")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.categories}
              filterType="category"
              selectedItems={filters.category}
              searchTerm={filterSearchTerms.category}
              onSearchChange={(value) =>
                onFilterSearchChange("category", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}

        {/* Property Type Filter */}
        {dynamicFilterOptions.propertyTypes.length > 0 && (
          <FilterSection
            title="Property Type"
            isExpanded={expandedFilters.property_type}
            onToggle={() => onToggleFilter("property_type")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.propertyTypes}
              filterType="property_type"
              selectedItems={filters.property_type}
              searchTerm={filterSearchTerms.property_type}
              onSearchChange={(value) =>
                onFilterSearchChange("property_type", value)
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
