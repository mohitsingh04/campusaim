"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	createDynamicFilterOptions,
	filterInstitutes,
} from "./utils/filterUtils";
import { LuGraduationCap } from "react-icons/lu";
import MobileFilterOverlay from "./_property_components/MobileFilterOverlay";
import FiltersContent from "./_property_components/_filters/filtersContent";
import ActiveFilterTags from "./_property_components/ActiveFilterTags";
import ResultsHeader from "./_property_components/ResultHeader";
import InstituteCard from "./_property_components/InstituteCard";
import Pagination from "./_property_components/Pagination";
import API from "@/contexts/API";
import {
	CategoryProps,
	CourseProps,
	ExpandedFiltersProps,
	FilterSearchTermsProps,
	FiltersProps,
	LocationProps,
	PropertyCourse,
	PropertyProps,
	ReviewProps,
} from "@/types/types";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import PropertiesLoader from "@/components/Loader/Property/PropertiesLoader";

type MergedCourse = PropertyCourse & Partial<CourseProps>;

const ITEMS_PER_PAGE = 10;

function Properties() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState("grid");
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [properties, setProperties] = useState<PropertyProps[]>([]);
	const [category, setCategory] = useState<CategoryProps[]>([]);
	const [loading, setLoading] = useState(true);

	const initializeFiltersFromURL = useCallback((): FiltersProps => {
		const urlFilters: FiltersProps = {
			country: [],
			state: [],
			city: [],
			course_name: [],
			course_type: [],
			course_format: [],
			rating: [],
			property_type: [],
			academic_type: [],
			category: [],
		};

		// Parse URL parameters
		Object.keys(urlFilters).forEach((key) => {
			const param = searchParams.get(key);
			if (param) {
				urlFilters[key as keyof FiltersProps] = param
					.split(",")
					.filter(Boolean);
			}
		});

		return urlFilters;
	}, [searchParams]);

	const [expandedFilters, setExpandedFilters] = useState<ExpandedFiltersProps>({
		country: true,
		state: true,
		city: true,
		course_name: true,
		course_type: true,
		course_format: true,
		rating: true,
		category: true,
		property_type: true,
		academic_type: true,
	});

	const [filters, setFilters] = useState<FiltersProps>(
		initializeFiltersFromURL
	);

	const [filterSearchTerms, setFilterSearchTerms] =
		useState<FilterSearchTermsProps>({
			country: "",
			state: "",
			city: "",
			course_name: "",
			course_type: "",
			course_format: "",
			category: "",
			property_type: "",
			academic_type: "",
		});

	// Update URL when filters change - Fixed to prevent render cycle issues
	const updateURL = useCallback(
		(newFilters: FiltersProps, page: number = 1) => {
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
				router.push(`/colleges${newURL}`, { scroll: false });
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

	// Helper function to find parent locations for auto-selection
	const findParentLocations = useCallback(
		(selectedValue: string, filterType: "city" | "state") => {
			const parentLocations = { country: "", state: "" };

			for (const property of properties) {
				if (filterType === "city" && property.property_city === selectedValue) {
					parentLocations.country = property.property_country || "";
					parentLocations.state = property.property_state || "";
					break;
				} else if (
					filterType === "state" &&
					property.property_state === selectedValue
				) {
					parentLocations.country = property.property_country || "";
					break;
				}
			}

			return parentLocations;
		},
		[properties]
	);

	const mergeCourseData = (
		propertyCourses: PropertyCourse[],
		courses: CourseProps[]
	) => {
		return propertyCourses.map((pc) => {
			const matchingCourse = courses.find((c) => c._id === pc.course_id);
			if (!matchingCourse) return pc;
			const merged = { ...pc };
			for (const key in matchingCourse) {
				if (!(key in pc)) {
					merged[key] = matchingCourse[key];
				}
			}
			return merged;
		});
	};

	const getCategories = useCallback(async () => {
		try {
			const response = await API.get(`/category`);
			setCategory(response.data);
		} catch (error) {
			console.error(error);
		}
	}, []);

	useEffect(() => {
		getCategories();
	}, [getCategories]);

	const getCategoryById = useCallback(
		(id: string) => {
			const cat = category?.find(
				(item) => item.uniqueId === Number(id) || item._id === id
			);
			return cat?.category_name;
		},
		[category]
	);
	const getAllPropertyDetails = useCallback(async () => {
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
			const [
				propertyRes,
				locationRes,
				reviewRes,
				propertyCourseRes,
				allCourseRes,
			] = await Promise.allSettled([
				API.get(`/property`),
				API.get(`/locations`),
				API.get(`/review`),
				API.get(`/property-course`),
				API.get(`/course`),
			]);

			if (
				propertyRes.status === "fulfilled" &&
				locationRes.status === "fulfilled" &&
				reviewRes.status === "fulfilled" &&
				propertyCourseRes.status === "fulfilled" &&
				allCourseRes.status === "fulfilled"
			) {
				const propertiesData =
					propertyRes?.value?.data.filter((item: PropertyProps) => {
						const type = getCategoryById(item?.academic_type);
						return (
							item?.status === "Active" &&
							(type === "College" || type === "University")
						);
					}) || [];
				const locationsData = locationRes?.value?.data || [];
				const reviewsData = reviewRes?.value?.data || [];
				const propertyCoursesData = propertyCourseRes?.value?.data || [];
				const allCoursesData = allCourseRes?.value?.data || [];

				const mergedProperties = propertiesData.map(
					(property: PropertyProps) => {
						const location = locationsData.find(
							(loc: LocationProps) => loc.property_id === property._id
						);
						const reviews = reviewsData.filter(
							(rev: ReviewProps) => rev.property_id === property._id
						);
						const propertyCourses = propertyCoursesData.filter(
							(pc: PropertyCourse) => pc.property_id === property._id
						);
						const mergedCourses = mergeCourseData(
							propertyCourses,
							allCoursesData
						);

						return {
							uniqueId: property.uniqueId,
							property_name: property?.property_name || "",
							featured_image: property?.featured_image || [],
							academic_type: getCategoryById(property?.academic_type) || "",
							property_type: getCategoryById(property?.property_type) || "",
							est_year: property?.est_year || "",
							property_slug: property?.property_slug || "",
							property_logo: property?.property_logo || [],
							property_description: property?.property_description || "",
							rank: property?.rank || 0,
							address: location?.property_address || "",
							pincode: location?.property_pincode || 0,
							city: location?.property_city || "",
							state: location?.property_state || "",
							country: location?.property_country || "",
							property_city: location?.property_city || "",
							property_state: location?.property_state || "",
							property_country: location?.property_country || "",
							reviews: reviews || [],
							courses: mergedCourses.map((course: MergedCourse) => ({
								property_id: course.property_id,
								image: course?.image || [],
								course_name: course?.course_name || "",
								course_type: getCategoryById(course?.course_type) || "",
								course_format: getCategoryById(course?.course_format) || "",
								duration: course?.duration || "",
							})),
						};
					}
				);
				// 🔀 Shuffle before setting state
				setProperties(shuffleArray(mergedProperties));
			}
		} catch (error) {
			console.error("Unexpected error in getAllPropertyDetails:", error);
		} finally {
			setLoading(false);
		}
	}, [getCategoryById]);

	useEffect(() => {
		getAllPropertyDetails();
	}, [getAllPropertyDetails]);

	// Dynamic filter options
	const dynamicFilterOptions = useMemo(
		() => createDynamicFilterOptions(properties),
		[properties]
	);

	const filteredInstitutes = useMemo(() => {
		return filterInstitutes(properties, searchTerm, filters);
	}, [searchTerm, filters, properties]);

	// Calculate total pages and slice institutes for the current page
	const totalPages = Math.ceil(filteredInstitutes.length / ITEMS_PER_PAGE);
	const displayedInstitutes: PropertyProps[] = filteredInstitutes.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const clearFilters = () => {
		const emptyFilters: FiltersProps = {
			country: [],
			state: [],
			city: [],
			course_name: [],
			course_type: [],
			course_format: [],
			rating: [],
			property_type: [],
			academic_type: [],
			category: [],
		};

		setFilters(emptyFilters);
		setFilterSearchTerms({
			country: "",
			state: "",
			city: "",
			course_name: "",
			course_type: "",
			course_format: "",
			category: "",
			property_type: "",
			academic_type: "",
		});
		setCurrentPage(1);
		updateURL(emptyFilters, 1);
	};

	const toggleFilter = (filterType: keyof ExpandedFiltersProps) => {
		setExpandedFilters((prev) => ({
			...prev,
			[filterType]: !prev[filterType],
		}));
	};

	const handleCheckboxFilter = (
		filterType: keyof FiltersProps,
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

			if (!currentValues.includes(value)) {
				if (filterType === "city") {
					const parentLocations = findParentLocations(value, "city");
					if (
						parentLocations.state &&
						!newFilters.state.includes(parentLocations.state)
					) {
						newFilters.state = [...newFilters.state, parentLocations.state];
					}

					// Auto-select country if not already selected
					if (
						parentLocations.country &&
						!newFilters.country.includes(parentLocations.country)
					) {
						newFilters.country = [
							...newFilters.country,
							parentLocations.country,
						];
					}
				} else if (filterType === "state") {
					const parentLocations = findParentLocations(value, "state");

					// Auto-select country if not already selected
					if (
						parentLocations.country &&
						!newFilters.country.includes(parentLocations.country)
					) {
						newFilters.country = [
							...newFilters.country,
							parentLocations.country,
						];
					}
				}
			}

			// Clear dependent filters when parent location changes (existing logic)
			if (filterType === "country") {
				newFilters.state = [];
				newFilters.city = [];
			} else if (filterType === "state") {
				newFilters.city = [];
			}

			setCurrentPage(1);
			updateURL(newFilters, 1);
			return newFilters;
		});
	};

	const removeFilterTag = (filterType: keyof FiltersProps, value: string) => {
		setFilters((prev) => {
			const newFiltersForRemove = {
				...prev,
				[filterType]: prev[filterType].filter((item) => item !== value),
			};
			updateURL(newFiltersForRemove, currentPage);
			return newFiltersForRemove;
		});
	};

	const handleFilterSearchChange = (
		filterType: keyof FilterSearchTermsProps,
		value: string
	) => {
		setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		updateURL(filters, page);
	};

	const handleViewModeChange = (mode: string) => {
		setViewMode(mode);
	};

	return (
		<div>
			{!loading ? (
				<div className="min-h-screen bg-purple-50 ">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div>
							<Breadcrumb items={[{ label: "Colleges" }]} />
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
									totalResults={filteredInstitutes.length}
									currentPage={currentPage}
									itemsPerPage={ITEMS_PER_PAGE}
									viewMode={viewMode}
									onViewModeChange={handleViewModeChange}
									onShowMobileFilters={() => setShowMobileFilters(true)}
								/>

								{/* Institutes Grid/List */}
								{displayedInstitutes.length > 0 ? (
									<div
										className={`${
											viewMode === "grid"
												? "grid grid-cols-1 lg:grid-cols-2 gap-6"
												: "space-y-6"
										}`}
									>
										{displayedInstitutes.map((institute, index) => (
											<InstituteCard
												key={institute.uniqueId || index}
												institute={institute}
												isListView={viewMode === "list"}
											/>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<LuGraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
										<h3 className="text-xl font-semibold text-gray-600 mb-2">
											No institutes found
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
			) : (
				<PropertiesLoader />
			)}
		</div>
	);
}

export default Properties;
