"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "./_courses_components/Pagination";
import { LuGraduationCap } from "react-icons/lu";
import CourseCard from "./_courses_components/CourseCard";
import ResultsHeader from "./_courses_components/ResultHeader";
import ActiveFilterTags from "./_courses_components/ActiveFilterTags";
import FiltersContent from "./_courses_components/_filters/filtersContent";
import MobileFilterOverlay from "./_courses_components/MobileFilterOverlay";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import { useRouter, useSearchParams } from "next/navigation";
import {
	CategoryProps,
	CourseProps,
	CourseFilters,
	ExpandedCourseFiltersProps,
	FilterCourseSearchTermsProps,
} from "@/types/types";
import {
	createDynamicFilterOptions,
	filterdCourses,
} from "./utils/filterUtils";
import API from "@/contexts/API";
import PropertiesLoader from "@/components/Loader/Property/PropertiesLoader";

const ITEMS_PER_PAGE = 10;

export default function AllCourse() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState("grid");
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [allCourses, setAllCourses] = useState<CourseProps[]>([]);
	const [category, setCategory] = useState<CategoryProps[]>([]);
	const [loading, setLoading] = useState(true);

	const getCategories = useCallback(async () => {
		try {
			const response = await API.get(`/category`);
			setCategory(response.data);
		} catch (error) {
			console.log(error);
		}
	}, []);

	useEffect(() => {
		getCategories();
	}, [getCategories]);

	const getCategoryById = useCallback(
		(id: string | string[] | undefined) => {
			if (!id || !category?.length) return "";

			// ✅ Handle multiple IDs
			if (Array.isArray(id)) {
				return id
					.map((singleId) => {
						const cat = category.find(
							(item) => String(item._id) === String(singleId)
						);
						return cat?.category_name;
					})
					.filter(Boolean)
					.join(", ");
			}

			// ✅ Handle single ID
			const cat = category.find((item) => String(item._id) === String(id));
			return cat?.category_name ?? "";
		},
		[category]
	);

	const getAllCourses = useCallback(async () => {
		setLoading(true);

		// 🔀 Utility function: Fisher-Yates shuffle
		const shuffleArray = <T,>(array: T[]): T[] => {
			const shuffled = [...array];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			return shuffled;
		};

		try {
			const [courseRes] = await Promise.allSettled([API.get(`/course`)]);

			if (courseRes.status === "fulfilled") {
				const coursesData =
					courseRes?.value?.data.filter(
						(item: CourseProps) => item?.status === "Active"
					) || [];

				const mergedProperties = coursesData.map((course: CourseProps) => {
					return {
						...course,
						course_type: getCategoryById(course.course_type),
						program_type: getCategoryById(course.program_type),
						specialization: getCategoryById(course.specialization),
					};
				});

				// 🔀 Shuffle before setting state
				setAllCourses(shuffleArray(mergedProperties));
			}
		} catch (error) {
			console.log("Unexpected error in getAllCourses:", error);
		} finally {
			setLoading(false);
		}
	}, [getCategoryById]);

	useEffect(() => {
		getAllCourses();
	}, [getAllCourses]);

	const initializeFiltersFromURL = useCallback((): CourseFilters => {
		const urlFilters: CourseFilters = {
			program_type: [],
			specialization: [],
			course_type: [],
			duration: [],
		};

		// Parse URL parameters
		Object.keys(urlFilters).forEach((key) => {
			const param = searchParams.get(key);
			if (param) {
				urlFilters[key as keyof CourseFilters] = param
					.split(",")
					.filter(Boolean);
			}
		});

		return urlFilters;
	}, [searchParams]);

	const [expandedFilters, setExpandedFilters] =
		useState<ExpandedCourseFiltersProps>({
			course_type: true,
			program_type: true,
			specialization: true,
			duration: true,
		});

	const [filters, setFilters] = useState<CourseFilters>(
		initializeFiltersFromURL
	);

	const [filterSearchTerms, setFilterSearchTerms] =
		useState<FilterCourseSearchTermsProps>({
			course_type: "",
			program_type: "",
			specialization: "",
			duration: "",
		});

	const updateURL = useCallback(
		(newFilters: CourseFilters, page: number = 1) => {
			const params = new URLSearchParams();

			// Add search term if exists
			if (searchTerm) {
				params.set("search", searchTerm);
			}

			// Add page if not first page
			if (page > 1) {
				params.set("page", page.toString());
			}

			// Add filters
			Object.entries(newFilters).forEach(([key, values]) => {
				if (values.length > 0) {
					params.set(key, values.join(","));
				}
			});

			const newURL = params.toString() ? `?${params.toString()}` : "";

			// Use setTimeout to avoid updating during render
			setTimeout(() => {
				router.push(`/courses${newURL}`, { scroll: false });
			}, 0);
		},
		[router, searchTerm]
	);
	// Initialize from URL on mount
	useEffect(() => {
		const urlSearchTerm = searchParams.get("search") || "";
		const urlPage = parseInt(searchParams.get("page") || "1");

		setSearchTerm(urlSearchTerm);
		setCurrentPage(urlPage);
		setFilters(initializeFiltersFromURL());
	}, [searchParams, initializeFiltersFromURL]);

	// Dynamic filter options
	const dynamicFilterOptions = useMemo(
		() => createDynamicFilterOptions(allCourses),
		[allCourses]
	);

	const filteredAllCourses = useMemo(() => {
		return filterdCourses(allCourses, searchTerm, filters);
	}, [searchTerm, filters, allCourses]);

	const totalPages = Math.ceil(filteredAllCourses.length / ITEMS_PER_PAGE);
	const displayedCourses: CourseProps[] = filteredAllCourses.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const clearFilters = () => {
		const emptyFilters: CourseFilters = {
			course_type: [],
			program_type: [],
			specialization: [],
			duration: [],
		};

		setFilters(emptyFilters);
		setFilterSearchTerms({
			course_type: "",
			program_type: "",
			specialization: "",
			duration: "",
		});
		setCurrentPage(1);
		updateURL(emptyFilters, 1);
	};

	const toggleFilter = (filterType: keyof ExpandedCourseFiltersProps) => {
		setExpandedFilters((prev) => ({
			...prev,
			[filterType]: !prev[filterType],
		}));
	};

	const handleCheckboxFilter = (
		filterType: keyof CourseFilters,
		value: string
	) => {
		setFilters((prev) => {
			const currentValues = prev[filterType] as string[];

			const newFilters = {
				...prev,
				[filterType]: currentValues.includes(value)
					? currentValues.filter((item) => item !== value)
					: [...currentValues, value],
			};

			setCurrentPage(1);
			updateURL(newFilters, 1);
			return newFilters;
		});
	};

	const handleFilterSearchChange = (
		filterType: keyof FilterCourseSearchTermsProps,
		value: string
	) => {
		setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
	};

	const removeFilterTag = (filterType: keyof CourseFilters, value: string) => {
		setFilters((prev) => {
			const currentValues = prev[filterType] ?? [];

			const newFiltersForRemove: CourseFilters = {
				...prev,
				[filterType]: currentValues.filter((item) => item !== value),
			};

			updateURL(newFiltersForRemove, currentPage);
			return newFiltersForRemove;
		});
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		updateURL(filters, page);
	};

	const handleViewModeChange = (mode: string) => {
		setViewMode(mode);
	};

	if (loading) <PropertiesLoader />;

	return (
		<div>
			<div className="min-h-screen bg-purple-50 ">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div>
						<Breadcrumb items={[{ label: "Courses" }]} />
					</div>
				</div>
				<MobileFilterOverlay
					isVisible={showMobileFilters}
					onClose={() => setShowMobileFilters(false)}
				>
					<FiltersContent
						dynamicFilterOptions={dynamicFilterOptions}
						filters={filters}
						filterSearchTerms={filterSearchTerms}
						expandedFilters={expandedFilters}
						onToggleFilter={toggleFilter}
						onCheckboxFilter={handleCheckboxFilter}
						onFilterSearchChange={handleFilterSearchChange}
					/>
				</MobileFilterOverlay>

				{/* Main Content */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
					<div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
						{/* Desktop Filters Sidebar */}
						<div className="hidden lg:block lg:w-80">
							<div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-6 sticky top-24">
								<FiltersContent
									dynamicFilterOptions={dynamicFilterOptions}
									filters={filters}
									filterSearchTerms={filterSearchTerms}
									expandedFilters={expandedFilters}
									onToggleFilter={toggleFilter}
									onCheckboxFilter={handleCheckboxFilter}
									onFilterSearchChange={handleFilterSearchChange}
								/>
							</div>
						</div>

						{/* Results */}
						<div className="flex-1">
							{/* Active Filter Tags */}
							<ActiveFilterTags
								filters={filters}
								onRemoveFilter={removeFilterTag}
								onClearAll={clearFilters}
							/>

							{/* Results Header */}
							<ResultsHeader
								totalResults={filteredAllCourses.length}
								currentPage={currentPage}
								itemsPerPage={ITEMS_PER_PAGE}
								viewMode={viewMode}
								onViewModeChange={handleViewModeChange}
								onShowMobileFilters={() => setShowMobileFilters(true)}
							/>

							{displayedCourses.length > 0 ? (
								<div
									className={`${
										viewMode === "grid"
											? "grid grid-cols-1 lg:grid-cols-2 gap-6"
											: "space-y-6"
									}`}
								>
									{displayedCourses.map((course, index) => (
										<CourseCard
											key={course.uniqueId || index}
											course={course}
											isListView={viewMode === "list"}
										/>
									))}
								</div>
							) : (
								<div className="text-center py-16">
									<LuGraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
									<h3 className="text-xl font-semibold text-gray-600 mb-2">
										No Courses found
									</h3>
									<p className="text-gray-500">
										Try adjusting your search or filters
									</p>
								</div>
							)}

							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={handlePageChange}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
