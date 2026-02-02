import { generateSlug } from "@/context/Callbacks";
import {
	courseFilterProps,
	DynamicFilterCourseOptionsProps,
} from "@/types/CourseFilterTypes";
import { CourseProps } from "@/types/Types";

export const matchesMultiWordSearch = (
	itemName: string,
	searchTerm: string,
): boolean => {
	if (!searchTerm.trim()) return true;

	const itemSlug = generateSlug(itemName);
	const searchSlug = generateSlug(searchTerm);

	const searchWords = searchSlug.split("-");

	return searchWords.every((word) => itemSlug.includes(word));
};

export const createDynamicFilterOptions = (
	allCourses: CourseProps[],
	searchTerm: string = "",
	currentFilters: courseFilterProps = {
		course_level: [],
		certification_type: [],
		duration: [],
		course_type: [],
		degree_type: [],
		program_type: [],
	},
): DynamicFilterCourseOptionsProps => {
	const getFilteredCoursesForCount = (
		excludeFilterType: keyof courseFilterProps,
	) => {
		return allCourses.filter((course) => {
			// Apply search term
			const matchesSearch = matchesMultiWordSearch(
				course.course_name,
				searchTerm,
			);

			// Apply all filters except the one we're calculating counts for
			const filtersToApply = Object.entries(currentFilters).filter(
				([key]) => key !== excludeFilterType,
			);

			return (
				filtersToApply.every(([filterType, filterValues]) => {
					if (!Array.isArray(filterValues) || filterValues.length === 0)
						return true;

					switch (filterType) {
						case "course_level":
							return (
								course.course_level &&
								filterValues.some(
									(cat) =>
										generateSlug(course.course_level || "") ===
										generateSlug(cat),
								)
							);
						case "course_type":
							return (
								course.course_type &&
								filterValues.some(
									(cat) =>
										generateSlug(course.course_type || "") ===
										generateSlug(cat),
								)
							);
						case "degree_type":
							return (
								course.degree_type &&
								filterValues.some(
									(cat) =>
										generateSlug(course.degree_type || "") ===
										generateSlug(cat),
								)
							);
						case "program_type":
							return (
								course.program_type &&
								filterValues.some(
									(cat) =>
										generateSlug(course.program_type || "") ===
										generateSlug(cat),
								)
							);
						case "certification_type":
							return (
								course.certification_type &&
								filterValues.some(
									(cat) =>
										generateSlug(course.certification_type || "") ===
										generateSlug(cat),
								)
							);
						case "duration":
							return (
								course.duration &&
								filterValues.some(
									(cat) =>
										generateSlug(course.duration || "") === generateSlug(cat),
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

	const filteredForCategories = getFilteredCoursesForCount("course_level");
	const filteredForCourseTypes = getFilteredCoursesForCount("course_type");
	const filteredForDegreeTypes = getFilteredCoursesForCount("degree_type");
	const filteredForProgramTypes = getFilteredCoursesForCount("program_type");
	const filteredForCertiType = getFilteredCoursesForCount("certification_type");
	const filteredForDuration = getFilteredCoursesForCount("duration");
	const allLevels = [
		...new Set(
			filteredForCategories
				.map((cour) => cour.course_level)
				.filter((course_level): course_level is string =>
					Boolean(course_level && course_level.trim()),
				),
		),
	];
	const allCourseTypes = [
		...new Set(
			filteredForCourseTypes
				.map((cour) => cour.course_type)
				.filter((course_type): course_type is string =>
					Boolean(course_type && course_type.trim()),
				),
		),
	];
	const allDegreeTypes = [
		...new Set(
			filteredForDegreeTypes
				.map((cour) => cour.degree_type)
				.filter((degree_type): degree_type is string =>
					Boolean(degree_type && degree_type.trim()),
				),
		),
	];
	const allProgramTypes = [
		...new Set(
			filteredForProgramTypes
				.map((cour) => cour.program_type)
				.filter((program_type): program_type is string =>
					Boolean(program_type && program_type.trim()),
				),
		),
	];
	const allCertiTypes = [
		...new Set(
			filteredForCertiType
				.map((cour) => cour.certification_type)
				.filter((certification_type): certification_type is string =>
					Boolean(certification_type && certification_type.trim()),
				),
		),
	];
	const allDuration = [
		...new Set(
			filteredForDuration
				.map((cour) => cour.duration)
				.filter((duration): duration is string =>
					Boolean(duration && duration.trim()),
				),
		),
	];

	return {
		courseLevels: allLevels.map((course_level) => ({
			name: course_level,
			value: course_level,
			count: filteredForCategories.filter(
				(cour) =>
					generateSlug(cour.course_level || "") === generateSlug(course_level),
			).length,
		})),
		courseTypes: allCourseTypes.map((course_type) => ({
			name: course_type,
			value: course_type,
			count: filteredForCategories.filter(
				(cour) =>
					generateSlug(cour.course_type || "") === generateSlug(course_type),
			).length,
		})),
		degreeTypes: allDegreeTypes.map((degree_type) => ({
			name: degree_type,
			value: degree_type,
			count: filteredForCategories.filter(
				(cour) =>
					generateSlug(cour.degree_type || "") === generateSlug(degree_type),
			).length,
		})),
		programTypes: allProgramTypes.map((program_type) => ({
			name: program_type,
			value: program_type,
			count: filteredForCategories.filter(
				(cour) =>
					generateSlug(cour.program_type || "") === generateSlug(program_type),
			).length,
		})),
		certificationType: allCertiTypes.map((certification_type) => ({
			name: certification_type,
			value: certification_type,
			count: filteredForCategories.filter(
				(cour) =>
					generateSlug(cour.certification_type || "") ===
					generateSlug(certification_type),
			).length,
		})),
		durationsLists: allDuration.map((duration) => ({
			name: duration,
			value: duration,
			count: filteredForDuration.filter(
				(cour) => generateSlug(cour.duration || "") === generateSlug(duration),
			).length,
		})),
	};
};

export const filterdCourses = (
	allCourses: CourseProps[],
	searchTerm: string,
	filters: courseFilterProps,
): CourseProps[] => {
	return allCourses.filter((course) => {
		// Search term matching
		const matchesSearch = matchesMultiWordSearch(
			course.course_name,
			searchTerm,
		);

		const matchesLevels =
			filters.course_level.length === 0 ||
			(course.course_level &&
				filters.course_level.some(
					(cat) =>
						generateSlug(course.course_level || "") === generateSlug(cat),
				));
		const matchesCourseTypes =
			filters.course_type.length === 0 ||
			(course.course_type &&
				filters.course_type.some(
					(cat) => generateSlug(course.course_type || "") === generateSlug(cat),
				));
		const matchesDegreeTypes =
			filters.degree_type.length === 0 ||
			(course.degree_type &&
				filters.degree_type.some(
					(cat) => generateSlug(course.degree_type || "") === generateSlug(cat),
				));
		const matchesProgramTypes =
			filters.program_type.length === 0 ||
			(course.program_type &&
				filters.program_type.some(
					(cat) =>
						generateSlug(course.program_type || "") === generateSlug(cat),
				));
		const matchesCertiTypes =
			filters?.certification_type?.length === 0 ||
			(course?.certification_type &&
				filters?.certification_type?.some(
					(cat) =>
						generateSlug(course.certification_type || "") === generateSlug(cat),
				));
		const matchesDurations =
			filters?.duration?.length === 0 ||
			(course.duration &&
				filters?.duration?.some(
					(cat) => generateSlug(course.duration || "") === generateSlug(cat),
				));

		return (
			matchesSearch &&
			matchesLevels &&
			matchesCourseTypes &&
			matchesDegreeTypes &&
			matchesProgramTypes &&
			matchesCertiTypes &&
			matchesDurations
		);
	});
};

export const getVisiblePageNumbers = (
	currentPage: number,
	totalPages: number,
): (number | string)[] => {
	const maxVisiblePages = 5;
	const pages: (number | string)[] = [];

	if (totalPages <= maxVisiblePages) {
		// Show all pages if total is less than or equal to max visible
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
