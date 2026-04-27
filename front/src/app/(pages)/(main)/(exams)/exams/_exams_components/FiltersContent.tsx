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
      </div>
    </div>
  );
};

export default FiltersContent;
