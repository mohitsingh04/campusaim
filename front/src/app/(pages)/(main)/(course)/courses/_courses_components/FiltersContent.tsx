import { FaFilter } from "react-icons/fa";
import FilterSection from "./FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import {
  courseFilterProps,
  DynamicFilterCourseOptionsProps,
  ExpandedCourseFiltersProps,
  FilterCourseSearchTermsProps,
} from "@/types/CourseFilterTypes";

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
        {dynamicFilterOptions.certificationType.length > 0 && (
          <FilterSection
            title="Certification Type"
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
            title="Duration"
            isExpanded={expandedFilters.duration}
            onToggle={() => onToggleFilter("duration")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.durationsLists}
              filterType="duration"
              selectedItems={filters.duration}
              searchTerm={filterSearchTerms.duration}
              onSearchChange={(value) =>
                onFilterSearchChange("duration", value)
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
