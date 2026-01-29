"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FaGraduationCap } from "react-icons/fa";
import FiltersContent from "./_property_components/FiltersContent";
import InstituteCard from "./_property_components/InstituteCard";
import MobileFiltersCanvas from "./_property_components/MobileFilters";
import ResultsHeader from "./_property_components/ResultsHeader";
import { useSearchParams, useRouter, notFound } from "next/navigation";
import {
	ExpandedFiltersProps,
	FilterSearchTermsProps,
	FiltersProps,
} from "@/types/PropertyFilterTypes";
import {
	PropertyCourseProps,
	PropertyLocationProps,
	PropertyProps,
	PropertyRankProps,
	PropertyReviewProps,
} from "@/types/PropertyTypes";
import { CategoryProps, CourseProps } from "@/types/Types";
import {
	createDynamicFilterOptions,
	filterInstitutes,
} from "./utils/filterUtils";
import API from "@/context/API";
// import ActiveFilterTags from "./_property_components/ActiveFilters";
import {
	generateSlug,
	getAverageRating,
	getErrorResponse,
	mergeCourseData,
	shuffleArray,
} from "@/context/Callbacks";
import Pagination from "@/ui/pagination/Pagination";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";

const ITEMS_PER_PAGE = 18;

type MergedCourse = PropertyCourseProps & Partial<CourseProps>;

export default function InstitutesPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState("grid");
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [properties, setProperties] = useState<PropertyProps[]>([]);
	const [category, setCategory] = useState<CategoryProps[]>([]);
	const [loading, setLoading] = useState(true);
	const [sortBy, setSortBy] = useState("default");
	const [wantedCategory, setWantedCategory] = useState<CategoryProps[]>([]);

	const initializeFiltersFromURL = useCallback((): FiltersProps => {
		const urlFilters: FiltersProps = {
			country: [],
			state: [],
			city: [],
			course_name: [],
			course_level: [],
			course_type: [],
			course_format: [],
			rating: [],
			category: [],
			property_type: [],
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
		course_level: true,
		course_type: true,
		course_format: true,
		rating: true,
		category: true,
		property_type: true,
	});

	const [filters, setFilters] = useState<FiltersProps>(
		initializeFiltersFromURL,
	);

	const [filterSearchTerms, setFilterSearchTerms] =
		useState<FilterSearchTermsProps>({
			country: "",
			state: "",
			city: "",
			course_name: "",
			course_level: "",
			course_type: "",
			course_format: "",
			category: "",
			property_type: "",
		});

	const updateURL = useCallback(
		(newFilters: FiltersProps, page: number = 1) => {
			const params = new URLSearchParams();

			if (searchTerm) {
				params.set("search", searchTerm);
			}

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
		[router, searchTerm],
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
		[properties],
	);

	const getCategories = useCallback(async () => {
		try {
			const response = await API.get(`/category`);
			setWantedCategory(
				response.data?.filter(
					(item: CategoryProps) =>
						generateSlug(item?.parent_category) ===
						generateSlug("Academic Type"),
				),
			);
			setCategory(response.data);
		} catch (error) {
			getErrorResponse(error, true);
		}
	}, []);

	useEffect(() => {
		getCategories();
	}, [getCategories]);

	useEffect(() => {
		const urlCategory = searchParams.get("category");
		if (!urlCategory) return;
		if (wantedCategory.length === 0) return;

		const slugExists = wantedCategory.some(
			(item) => generateSlug(item.category_name) === urlCategory,
		);

		if (!slugExists) {
			notFound();
		}
	}, [wantedCategory, searchParams]);

	const getCategoryById = useCallback(
		(id: string) => {
			const cat = category?.find((item) => item._id === id);
			return cat?.category_name;
		},
		[category],
	);
	const getAllPropertyDetails = useCallback(async () => {
		setLoading(true);
		if (category?.length <= 0) return;

		try {
			const [
				propertyRes,
				locationRes,
				reviewRes,
				propertyCourseRes,
				allCourseRes,
				rankRes,
			] = await Promise.allSettled([
				API.get(`/property`),
				API.get(`/locations`),
				API.get(`/review`),
				API.get(`/property-course`),
				API.get(`/course`),
				API.get(`/ranks`),
			]);

			if (
				propertyRes.status === "fulfilled" &&
				locationRes.status === "fulfilled" &&
				reviewRes.status === "fulfilled" &&
				propertyCourseRes.status === "fulfilled" &&
				allCourseRes.status === "fulfilled" &&
				rankRes.status === "fulfilled"
			) {
				const propertiesData =
					propertyRes?.value?.data.filter(
						(item: PropertyProps) => item?.status === "Active",
					) || [];
				const locationsData = locationRes?.value?.data || [];
				const reviewsData = reviewRes?.value?.data || [];
				const propertyCoursesData = propertyCourseRes?.value?.data || [];
				const allCoursesData = allCourseRes?.value?.data || [];
				const allRankData = rankRes.value.data || [];

				const mergedProperties = propertiesData.map(
					(property: PropertyProps) => {
						const location = locationsData.find(
							(loc: PropertyLocationProps) => loc.property_id === property._id,
						);
						const reviews = reviewsData.filter(
							(rev: PropertyReviewProps) => rev.property_id === property._id,
						);
						const rankFound = allRankData.find(
							(ran: PropertyRankProps) =>
								String(ran.property_id) === property._id,
						);
						const propertyCourses = propertyCoursesData.filter(
							(pc: PropertyCourseProps) => pc.property_id === property._id,
						);
						const mergedCourses = mergeCourseData(
							propertyCourses,
							allCoursesData,
						);

						return {
							uniqueId: property.uniqueId,
							property_name: property?.property_name || "",
							featured_image: property?.featured_image || [],
							category: getCategoryById(property?.academic_type) || "",
							property_type: getCategoryById(property?.property_type) || "",
							est_year: property?.est_year || "",
							property_slug: property?.property_slug || "",
							property_logo: property?.property_logo || [],
							property_description: property?.property_description || "",
							rank: rankFound?.rank || 0,
							lastRank: rankFound?.lastRank || 0,
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
								course_level: getCategoryById(course?.course_level) || "",
								course_type: getCategoryById(course?.course_type) || "",
								course_format: getCategoryById(course?.course_format) || "",
								duration: course?.duration || "",
							})),
						};
					},
				);

				// 🔀 Shuffle before setting state
				setProperties(shuffleArray(mergedProperties));
			}
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, [getCategoryById, category]);

	useEffect(() => {
		getAllPropertyDetails();
	}, [getAllPropertyDetails]);

	const isDataReady = useMemo(() => {
		return !loading && properties.length > 0 && category.length > 0;
	}, [loading, properties, category]);

	// Dynamic filter options
	const dynamicFilterOptions = useMemo(
		() => createDynamicFilterOptions(properties),
		[properties],
	);
	const filteredInstitutes = useMemo(() => {
		if (!isDataReady) return [];

		let list = filterInstitutes(properties, searchTerm, filters);

		if (sortBy === "rank") {
			list = [...list].sort((a, b) => (a?.rank ?? 9999) - (b?.rank ?? 9999));
		}

		if (sortBy === "rating") {
			list = [...list].sort(
				(a, b) =>
					getAverageRating(b?.reviews || []) -
					getAverageRating(a?.reviews || []),
			);
		}

		if (sortBy === "A-Z") {
			list = [...list].sort((a, b) =>
				(a?.property_name || a?.property_name || "")
					.toLowerCase()
					.localeCompare(
						(b?.property_name || b?.property_name || "").toLowerCase(),
					),
			);
		}

		if (sortBy === "Z-A") {
			list = [...list].sort((a, b) =>
				(b?.property_name || b?.property_name || "")
					.toLowerCase()
					.localeCompare(
						(a?.property_name || a?.property_name || "").toLowerCase(),
					),
			);
		}

		return list;
	}, [isDataReady, properties, searchTerm, filters, sortBy]);

	// Calculate total pages and slice institutes for the current page
	const totalPages = Math.ceil(filteredInstitutes.length / ITEMS_PER_PAGE);
	const displayedInstitutes: PropertyProps[] = filteredInstitutes.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	const clearFilters = () => {
		const emptyFilters: FiltersProps = {
			country: [],
			state: [],
			city: [],
			course_name: [],
			course_level: [],
			course_type: [],
			course_format: [],
			rating: [],
			category: [],
			property_type: [],
		};

		setFilters(emptyFilters);
		setFilterSearchTerms({
			country: "",
			state: "",
			city: "",
			course_name: "",
			course_level: "",
			course_type: "",
			course_format: "",
			category: "",
			property_type: "",
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
		value: string,
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

	// const removeFilterTag = (filterType: keyof FiltersProps, value: string) => {
	//   setFilters((prev) => {
	//     const newFiltersForRemove = {
	//       ...prev,
	//       [filterType]: prev[filterType].filter((item) => item !== value),
	//     };
	//     updateURL(newFiltersForRemove, currentPage);
	//     return newFiltersForRemove;
	//   });
	// };

	const handleFilterSearchChange = (
		filterType: keyof FilterSearchTermsProps,
		value: string,
	) => {
		setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
	};

	const handleViewModeChange = (mode: string) => {
		setViewMode(mode);
	};

	if (loading) return <InsitutesLoader />;

	return (
		<section className="bg-(--secondary-bg) text-(--text-color) py-8">
			<div className="container mx-auto px-4">
				<MobileFiltersCanvas
					isOpen={showMobileFilters}
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
						onClearAll={clearFilters}
					/>
				</MobileFiltersCanvas>

				<div className="flex lg:flex-row gap-6 lg:min-h-[80vh] relative">
					{/* LEFT FILTER COLUMN */}
					<div className="hidden lg:block lg:w-80 bg-(--primary-bg) rounded-custom shadow-custom sticky top-20 max-h-screen! overflow-y-auto">
						<FiltersContent
							dynamicFilterOptions={dynamicFilterOptions}
							filters={filters}
							filterSearchTerms={filterSearchTerms}
							expandedFilters={expandedFilters}
							onToggleFilter={toggleFilter}
							onCheckboxFilter={handleCheckboxFilter}
							onFilterSearchChange={handleFilterSearchChange}
							onClearAll={clearFilters}
						/>
					</div>

					{/* RIGHT MAIN COLUMN */}
					<div className="flex-1 flex flex-col overflow-hidden">
						{/* <ActiveFilterTags
              filters={filters}
              onRemoveFilter={removeFilterTag}
              onClearAll={clearFilters}
            /> */}

						<ResultsHeader
							totalResults={filteredInstitutes.length}
							currentPage={currentPage}
							itemsPerPage={ITEMS_PER_PAGE}
							viewMode={viewMode}
							onViewModeChange={handleViewModeChange}
							onShowMobileFilters={() => setShowMobileFilters(true)}
							sortBy={sortBy}
							onSortChange={setSortBy}
						/>

						{/* SCROLLABLE BODY */}
						<div className="flex-1 overflow-y-auto pr-1 pb-10">
							{isDataReady && displayedInstitutes.length <= 0 ? (
								<div className="text-center py-16 bg-(--primary-bg) rounded-custom shadow-custom">
									<FaGraduationCap className="w-16 h-16 mx-auto mb-4" />
									<h3 className="heading font-bold mb-2">
										No institutes found
									</h3>
									<p>Try adjusting your filters.</p>
								</div>
							) : (
								<div
									className={
										viewMode === "grid"
											? "grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6"
											: "space-y-6"
									}
								>
									{displayedInstitutes.map((item, i) => (
										<InstituteCard
											key={i}
											institute={item}
											isListView={viewMode === "list"}
										/>
									))}
								</div>
							)}
						</div>

						{/* PAGINATION */}
						{totalPages > 1 && (
							<div>
								<Pagination currentPage={currentPage} totalPages={totalPages} />
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
