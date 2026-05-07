import FilterSection from "./FilterSection";
import CheckboxFilter from "./CheckboxFilter";
import { FilterIcon } from "lucide-react";
import {
  DynamicFilterExamOptionsProps,
  ExamFilterProps,
  ExpandedExamFiltersProps,
  FilterExamSearchTermsProps,
} from "@/types/ExamFilterTypes";

interface FiltersContentProps {
  dynamicFilterOptions: DynamicFilterExamOptionsProps;
  filters: ExamFilterProps;
  filterSearchTerms: FilterExamSearchTermsProps;
  expandedFilters: ExpandedExamFiltersProps;
  onToggleFilter: (filterType: keyof ExpandedExamFiltersProps) => void;
  onCheckboxFilter: (filterType: keyof ExamFilterProps, value: string) => void;
  onFilterSearchChange: (
    filterType: keyof FilterExamSearchTermsProps,
    value: string,
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
          <FilterIcon className="w-4 h-4 mr-2 text-(--main)" /> Filters
        </span>

        <button
          onClick={onClearAll}
          className="text-(--main) hover:underline font-medium flex items-center cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <div className="p-5">
        {dynamicFilterOptions.examMode.length > 0 && (
          <FilterSection
            title="Exam Mode"
            isExpanded={expandedFilters.exam_mode}
            onToggle={() => onToggleFilter("exam_mode")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.examMode}
              filterType="exam_mode"
              selectedItems={filters.exam_mode}
              searchTerm={filterSearchTerms.exam_mode}
              onSearchChange={(value) =>
                onFilterSearchChange("exam_mode", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}
        {dynamicFilterOptions.examType.length > 0 && (
          <FilterSection
            title="Exam Type"
            isExpanded={expandedFilters.exam_type}
            onToggle={() => onToggleFilter("exam_type")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.examType}
              filterType="exam_type"
              selectedItems={filters.exam_type}
              searchTerm={filterSearchTerms.exam_type}
              onSearchChange={(value) =>
                onFilterSearchChange("exam_type", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}
        {dynamicFilterOptions.examTag.length > 0 && (
          <FilterSection
            title="Exam Tags"
            isExpanded={expandedFilters.exam_tag}
            onToggle={() => onToggleFilter("exam_tag")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.examTag}
              filterType="exam_tag"
              selectedItems={filters.exam_tag}
              searchTerm={filterSearchTerms.exam_tag}
              onSearchChange={(value) =>
                onFilterSearchChange("exam_tag", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}
        {dynamicFilterOptions.upcomingExamMonths.length > 0 && (
          <FilterSection
            title="Upcoming Exam Months"
            isExpanded={expandedFilters.upcoming_exam_month}
            onToggle={() => onToggleFilter("upcoming_exam_month")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.upcomingExamMonths}
              filterType="upcoming_exam_month"
              selectedItems={filters.upcoming_exam_month}
              searchTerm={filterSearchTerms.upcoming_exam_month}
              onSearchChange={(value) =>
                onFilterSearchChange("upcoming_exam_month", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}
        {dynamicFilterOptions.resultMonths.length > 0 && (
          <FilterSection
            title="Exam Result Months"
            isExpanded={expandedFilters.result_month}
            onToggle={() => onToggleFilter("result_month")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.resultMonths}
              filterType="result_month"
              selectedItems={filters.result_month}
              searchTerm={filterSearchTerms.result_month}
              onSearchChange={(value) =>
                onFilterSearchChange("result_month", value)
              }
              onFilterChange={
                onCheckboxFilter as (filterType: string, value: string) => void
              }
            />
          </FilterSection>
        )}
        {dynamicFilterOptions.applicationMonth.length > 0 && (
          <FilterSection
            title="Exam Application Months"
            isExpanded={expandedFilters.application_month}
            onToggle={() => onToggleFilter("application_month")}
          >
            <CheckboxFilter
              items={dynamicFilterOptions.applicationMonth}
              filterType="application_month"
              selectedItems={filters.application_month}
              searchTerm={filterSearchTerms.application_month}
              onSearchChange={(value) =>
                onFilterSearchChange("application_month", value)
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
