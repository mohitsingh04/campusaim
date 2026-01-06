import { generateSlug } from "@/contexts/Callbacks";
import {
	DynamicFilterCourseOptionsProps,
	CourseProps,
	CourseFilters,
} from "@/types/types";

/* ----------------------------------------
   Helpers
---------------------------------------- */

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

/* ----------------------------------------
   Dynamic Filter Options
---------------------------------------- */

const normalize = (value?: string | string[]) =>
	Array.isArray(value) ? value : value ? [value] : [];

export const createDynamicFilterOptions = (
	allCourses: CourseProps[],
	searchTerm = "",
	currentFilters: CourseFilters = {}
): DynamicFilterCourseOptionsProps => {
	const getFilteredCoursesForCount = (
		excludeFilterType: keyof CourseFilters
	) => {
		return allCourses.filter((course) => {
			const matchesSearch = matchesMultiWordSearch(
				course.course_name,
				searchTerm
			);

			const filtersToApply = Object.entries(currentFilters).filter(
				([key]) => key !== excludeFilterType
			);

			const matchesFilters = filtersToApply.every(
				([filterType, filterValues]) => {
					if (!Array.isArray(filterValues) || filterValues.length === 0)
						return true;

					const courseValue = course[filterType as keyof CourseProps];

					if (!courseValue) return false;

					return filterValues.some(
						(val) => generateSlug(String(courseValue)) === generateSlug(val)
					);
				}
			);

			return matchesSearch && matchesFilters;
		});
	};

	const filteredForTypes = getFilteredCoursesForCount("course_type");
	const filteredForProgram = getFilteredCoursesForCount("program_type");
	const filteredForSpecialization =
		getFilteredCoursesForCount("specialization");
	const filteredForDuration = getFilteredCoursesForCount("duration");

	const unique = (arr: (string | undefined)[]) =>
		[...new Set(arr.filter(Boolean))] as string[];

	return {
		courseTypes: unique(filteredForTypes.map((c) => c.course_type)).map(
			(val) => ({
				name: val,
				value: val,
				count: filteredForTypes.filter(
					(c) => generateSlug(c.course_type || "") === generateSlug(val)
				).length,
			})
		),

		programType: unique(
			filteredForProgram.flatMap((c) => normalize(c.program_type))
		).map((val) => ({
			name: val,
			value: val,
			count: filteredForProgram.filter((c) =>
				normalize(c.program_type).some(
					(p) => generateSlug(p) === generateSlug(val)
				)
			).length,
		})),

		specializationType: unique(
			filteredForSpecialization.flatMap((c) => normalize(c.specialization))
		).map((val) => ({
			name: val,
			value: val,
			count: filteredForSpecialization.filter((c) =>
				normalize(c.specialization).some(
					(p) => generateSlug(p) === generateSlug(val)
				)
			).length,
		})),

		durationsLists: unique(filteredForDuration.map((c) => c.duration)).map(
			(val) => ({
				name: val,
				value: val,
				count: filteredForDuration.filter(
					(c) => generateSlug(c.duration || "") === generateSlug(val)
				).length,
			})
		),
	};
};

/* ----------------------------------------
   Filter Courses
---------------------------------------- */

export const filterdCourses = (
	allCourses: CourseProps[],
	searchTerm: string,
	filters: CourseFilters
): CourseProps[] => {
	return allCourses.filter((course) => {
		const matchesSearch = matchesMultiWordSearch(
			course.course_name,
			searchTerm
		);

		const matchArray = (
			filterValues?: string[],
			courseValue?: string | string[]
		) => {
			if (!filterValues?.length) return true;
			if (!courseValue) return false;

			const courseValues = Array.isArray(courseValue)
				? courseValue
				: [courseValue];

			return filterValues.some((filterVal) =>
				courseValues.some(
					(val) => generateSlug(val) === generateSlug(filterVal)
				)
			);
		};

		return (
			matchesSearch &&
			matchArray(filters.course_type, course.course_type) &&
			matchArray(filters.program_type, course.program_type) &&
			matchArray(filters.specialization, course.specialization) &&
			matchArray(filters.duration, course.duration)
		);
	});
};

/* ----------------------------------------
   Pagination Helper
---------------------------------------- */

export const getVisiblePageNumbers = (
	currentPage: number,
	totalPages: number
): (number | string)[] => {
	const maxVisible = 5;
	const pages: (number | string)[] = [];

	if (totalPages <= maxVisible) {
		for (let i = 1; i <= totalPages; i++) pages.push(i);
	} else if (currentPage <= 3) {
		pages.push(1, 2, 3, 4, 5, "ellipsis", totalPages);
	} else if (currentPage >= totalPages - 2) {
		pages.push(1, "ellipsis");
		for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
	} else {
		pages.push(1, "ellipsis");
		for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
		pages.push("ellipsis", totalPages);
	}

	return pages;
};
