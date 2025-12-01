import React from "react";
import { LuFilter } from "react-icons/lu";
import CheckboxFilter from "./checkBoxFilter";
import FilterSection from "./filterSection";
import {
  courseFilterProps,
  DynamicFilterCourseOptionsProps,
  ExpandedCourseFiltersProps,
  FilterCourseSearchTermsProps,
} from "@/types/types";

interface FiltersContentProps {
  dynamicFilterOptions: DynamicFilterCourseOptionsProps;
  filters: courseFilterProps;
  filterSearchTerms: FilterCourseSearchTermsProps;
  expandedFilters: ExpandedCourseFiltersProps;
  onToggleFilter: (filterType: keyof ExpandedCourseFiltersProps) => void;
  onCheckboxFilter: (
    filterType: keyof courseFilterProps,
    value: string
  ) => void;
  onFilterSearchChange: (
    filterType: keyof FilterCourseSearchTermsProps,
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <LuFilter className="w-5 h-5 mr-2 text-purple-600" />
          Filters
        </h3>
      </div>

      {/* Category Filter */}
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
          title="Course Types"
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
      {dynamicFilterOptions.certificationType.length > 0 && (
        <FilterSection
          title="Certifications Types"
          isExpanded={expandedFilters.certification_type}
          onToggle={() => onToggleFilter("certification_type")}
        >
          <CheckboxFilter
            items={dynamicFilterOptions.certificationType}
            filterType="certification_type"
            selectedItems={filters.certification_type}
            searchTerm={filterSearchTerms.certification_type}
            onSearchChange={(value) =>
              onFilterSearchChange("certification_type", value)
            }
            onFilterChange={
              onCheckboxFilter as (filterType: string, value: string) => void
            }
          />
        </FilterSection>
      )}
      {dynamicFilterOptions.durationsLists.length > 0 && (
        <FilterSection
          title="Durations"
          isExpanded={expandedFilters.duration}
          onToggle={() => onToggleFilter("duration")}
        >
          <CheckboxFilter
            items={dynamicFilterOptions.durationsLists}
            filterType="duration"
            selectedItems={filters.duration}
            searchTerm={filterSearchTerms.duration}
            onSearchChange={(value) => onFilterSearchChange("duration", value)}
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
