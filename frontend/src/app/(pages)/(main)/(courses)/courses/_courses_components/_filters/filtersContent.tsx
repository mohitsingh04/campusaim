import React from "react";
import { LuFilter } from "react-icons/lu";
import CheckboxFilter from "./checkBoxFilter";
import FilterSection from "./filterSection";
import {
	CourseFilters,
	DynamicFilterCourseOptionsProps,
	ExpandedCourseFiltersProps,
	FilterCourseSearchTermsProps,
} from "@/types/types";

interface FiltersContentProps {
	dynamicFilterOptions: DynamicFilterCourseOptionsProps;
	filters: CourseFilters;
	filterSearchTerms: FilterCourseSearchTermsProps;
	expandedFilters: ExpandedCourseFiltersProps;
	onToggleFilter: (filterType: keyof ExpandedCourseFiltersProps) => void;
	onCheckboxFilter: (
		filterType: keyof CourseFilters,
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

			{/* Course Types Filter */}
			{dynamicFilterOptions.courseTypes.length > 0 && (
				<FilterSection
					title="Course Types"
					isExpanded={expandedFilters.course_type}
					onToggle={() => onToggleFilter("course_type")}
				>
					<CheckboxFilter
						items={dynamicFilterOptions.courseTypes}
						filterType="course_type"
						selectedItems={filters.course_type ?? []}
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

			{/* Specialization Filter */}
			{dynamicFilterOptions.specializationType.length > 0 && (
				<FilterSection
					title="Specialization"
					isExpanded={expandedFilters.specialization}
					onToggle={() => onToggleFilter("specialization")}
				>
					<CheckboxFilter
						items={dynamicFilterOptions.specializationType}
						filterType="specialization"
						selectedItems={filters.specialization ?? []}
						searchTerm={filterSearchTerms.specialization}
						onSearchChange={(value) =>
							onFilterSearchChange("specialization", value)
						}
						onFilterChange={
							onCheckboxFilter as (filterType: string, value: string) => void
						}
					/>
				</FilterSection>
			)}

			{/* Program Type Filter */}
			{dynamicFilterOptions.programType.length > 0 && (
				<FilterSection
					title="Program Type"
					isExpanded={expandedFilters.program_type}
					onToggle={() => onToggleFilter("program_type")}
				>
					<CheckboxFilter
						items={dynamicFilterOptions.programType}
						filterType="program_type"
						selectedItems={filters.program_type ?? []}
						searchTerm={filterSearchTerms.program_type}
						onSearchChange={(value) =>
							onFilterSearchChange("program_type", value)
						}
						onFilterChange={
							onCheckboxFilter as (filterType: string, value: string) => void
						}
					/>
				</FilterSection>
			)}

			{/* Durations Filter  */}
			{dynamicFilterOptions.durationsLists.length > 0 && (
				<FilterSection
					title="Durations"
					isExpanded={expandedFilters.duration}
					onToggle={() => onToggleFilter("duration")}
				>
					<CheckboxFilter
						items={dynamicFilterOptions.durationsLists}
						filterType="duration"
						selectedItems={filters.duration ?? []}
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
