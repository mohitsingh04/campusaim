import React from "react";
import { LuFilter, LuStar } from "react-icons/lu";
import CheckboxFilter from "./checkBoxFilter";
import FilterSection from "./filterSection";
import { FilterSearchTermsProps } from "@/types/types";

interface FilterItem {
  name: string;
  count: number;
}

interface CategoryItem {
  name: string;
  value: string;
  count: number;
}

interface RatingCount {
  rating: number;
  count: number;
}

interface DynamicFilterOptions {
  countries: FilterItem[];
  getStatesForCountries: (selectedCountries?: string[]) => string[];
  getCitiesForLocation: (
    selectedCountries?: string[],
    selectedStates?: string[]
  ) => string[];
  getStatesWithCounts: (selectedCountries?: string[]) => FilterItem[];
  getCitiesWithCounts: (
    selectedCountries?: string[],
    selectedStates?: string[]
  ) => FilterItem[];
  courseNames: FilterItem[];
  courseLevels: FilterItem[];
  courseTypes: FilterItem[];
  courseFormats: FilterItem[];
  categories: CategoryItem[];
  propertyTypes: CategoryItem[];
  ratingCounts: RatingCount[];
}

interface Filters {
  country: string[];
  state: string[];
  city: string[];
  course_name: string[];
  course_level: string[];
  course_type: string[];
  course_format: string[];
  rating: string[];
  category: string[];
  property_type: string[];
}

interface ExpandedFilters {
  country: boolean;
  state: boolean;
  city: boolean;
  course_name: boolean;
  course_level: boolean;
  course_type: boolean;
  course_format: boolean;
  rating: boolean;
  category: boolean;
  property_type: boolean;
}

interface FiltersContentProps {
  dynamicFilterOptions: DynamicFilterOptions;
  filters: Filters;
  filterSearchTerms: FilterSearchTermsProps;
  expandedFilters: ExpandedFilters;
  onToggleFilter: (filterType: keyof ExpandedFilters) => void;
  onCheckboxFilter: (filterType: keyof Filters, value: string) => void;
  onFilterSearchChange: (
    filterType: keyof FilterSearchTermsProps,
    value: string
  ) => void;
}

const FiltersContent: React.FC<FiltersContentProps> = ({
  dynamicFilterOptions,
  filters,
  filterSearchTerms,
  expandedFilters,
  onToggleFilter,
  onCheckboxFilter,
  onFilterSearchChange,
}) => {
  // Get states with proper counts from unfiltered data
  const availableStates = dynamicFilterOptions.getStatesWithCounts(filters.country);

  // Get cities with proper counts from unfiltered data
  const availableCities = dynamicFilterOptions.getCitiesWithCounts(
    filters.country,
    filters.state
  );

  // Rating options with counts from dynamic filter options
  const ratingOptions = [
    { name: "5 Stars", value: "5", count: dynamicFilterOptions.ratingCounts.find(r => r.rating === 5)?.count || 0 },
    { name: "4 Stars", value: "4", count: dynamicFilterOptions.ratingCounts.find(r => r.rating === 4)?.count || 0 },
    { name: "3 Stars", value: "3", count: dynamicFilterOptions.ratingCounts.find(r => r.rating === 3)?.count || 0 },
    { name: "2 Stars", value: "2", count: dynamicFilterOptions.ratingCounts.find(r => r.rating === 2)?.count || 0 },
    { name: "1 Star", value: "1", count: dynamicFilterOptions.ratingCounts.find(r => r.rating === 1)?.count || 0 },
  ];

  const RatingFilter = () => (
    <div className="space-y-2">
      {ratingOptions.map((option) => (
        <label
          key={option.value}
          className="flex items-center justify-between cursor-pointer group hover:bg-gray-50 p-1 rounded transition-colors"
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={filters.rating.includes(option.value)}
              onChange={() => onCheckboxFilter("rating", option.value)}
              className="appearance-none w-4 h-4 bg-white border-2 r rounded border-white outline outline-purple-500 checked:bg-purple-600 transition-all duration-300"
            />
            <div className="ml-2 flex items-center">
              <div className="flex">
                {[...Array(Number(option.value))].map((_, i) => (
                  <LuStar
                    key={i}
                    className={`w-4 h-4 text-yellow-400 fill-current`}
                  />
                ))}
                {[...Array(5 - Number(option.value))].map((_, i) => (
                  <LuStar
                    key={i + Number(option.value)}
                    className={`w-4 h-4 text-gray-300`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-700 group-hover:text-purple-600 transition-colors">
                {option.name}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500">({option.count})</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <LuFilter className="w-5 h-5 mr-2 text-purple-600" />
          Filters
        </h3>
      </div>

      {/* Location Filters (Interlinked) */}
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

      {/* Course Filters */}
      {dynamicFilterOptions.courseNames.length > 0 && (
        <FilterSection
          title="Course Name"
          isExpanded={expandedFilters.course_name}
          onToggle={() => onToggleFilter("course_name")}
        >
          <CheckboxFilter
            items={dynamicFilterOptions.courseNames}
            filterType="course_name"
            selectedItems={filters.course_name}
            searchTerm={filterSearchTerms.course_name}
            onSearchChange={(value) =>
              onFilterSearchChange("course_name", value)
            }
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
        <RatingFilter />
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
            onSearchChange={(value) => onFilterSearchChange("category", value)}
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
  );
};

export default FiltersContent;