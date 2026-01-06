"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import ComparisonTable from "../_compare_components/ComparisonTable";
import CompareModal from "../_compare_components/CompareModal";
import {
	CategoryProps,
	CourseProps,
	LocationProps,
	PropertyAmenities,
	PropertyCourse,
	PropertyProps,
	ReviewProps,
} from "@/types/types";
import API from "@/contexts/API";
import BasicDetailTable from "../_compare_components/BasicDetailTable";
import MainGridCard from "../_compare_components/MainGridCard";
import { useRouter } from "next/navigation";
import { getProfile } from "@/contexts/getAssets";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import CompareLoader from "@/components/Loader/Compare/CompareLoader";
import { LuLink } from "react-icons/lu";
import Link from "next/link";
import { generateSlug } from "@/contexts/Callbacks";

type MergedCourse = PropertyCourse & Partial<CourseProps>;

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

const CompareProperties = ({ slugs }: { slugs?: string[] }) => {
	const [selectedProperties, setSelectedProperties] = useState<PropertyProps[]>(
		[]
	);
	const [modalOpen, setModalOpen] = useState(false);
	const [allProperties, setAllProperties] = useState<PropertyProps[]>([]);
	const [category, setCategory] = useState<CategoryProps[]>([]);
	const [loading, setLoading] = useState(true);
	const [dataLoaded, setDataLoaded] = useState(false);
	const router = useRouter();

	const getCategoryById = useCallback(
		(id: string) => {
			const cat = category.find(
				(item) =>
					Number(item.uniqueId) === Number(id) ||
					String(item?._id) === String(id)
			);
			return cat?.category_name;
		},
		[category]
	);

	useEffect(() => {
		if (dataLoaded && allProperties.length > 0) {
			if (slugs && slugs.length > 0) {
				const matchedProperties = allProperties.filter((prop) => {
					return slugs.includes(prop.property_slug);
				});

				if (matchedProperties.length > 0) {
					setSelectedProperties(matchedProperties);
					if (matchedProperties.length < slugs.length) {
						setModalOpen(true);
					}
				} else {
					setModalOpen(true);
				}
			} else {
				setModalOpen(true);
			}
		}
	}, [dataLoaded, allProperties, slugs]);

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

	const getAllPropertyDetails = useCallback(async () => {
		setLoading(true);
		try {
			const [
				propertyRes,
				locationRes,
				reviewRes,
				propertyCourseRes,
				allCourseRes,
				amenitiesRes,
			] = await Promise.allSettled([
				API.get(`/property`),
				API.get<LocationProps[]>(`/locations`),
				API.get(`/review`),
				API.get(`/property-course`),
				API.get(`/course`),
				API.get<PropertyAmenities[]>(`/amenities`),
			]);

			if (
				propertyRes.status === "fulfilled" &&
				locationRes.status === "fulfilled" &&
				reviewRes.status === "fulfilled" &&
				propertyCourseRes.status === "fulfilled" &&
				allCourseRes.status === "fulfilled" &&
				amenitiesRes.status === "fulfilled"
			) {
				const propertiesData = propertyRes.value?.data || [];
				const locationsData = locationRes.value?.data || [];
				const reviewsData = reviewRes.value?.data || [];
				const propertyCoursesData = propertyCourseRes.value?.data || [];
				const allCoursesData = allCourseRes.value?.data || [];
				const amenitiesData = amenitiesRes?.value?.data || [];

				const locationMap = new Map(
					locationsData.map((loc: LocationProps) => [
						Number(loc.property_id),
						loc,
					])
				);

				const reviewMap = new Map<number, ReviewProps[]>();
				reviewsData.forEach((rev: ReviewProps) => {
					const propId = Number(rev.property_id);
					if (!reviewMap.has(propId)) {
						reviewMap.set(propId, []);
					}
					reviewMap.get(propId)!.push(rev);
				});

				const courseMap = new Map<string, PropertyCourse[]>();
				propertyCoursesData.forEach((pc: PropertyCourse) => {
					const propId = String(pc.property_id);
					if (!courseMap.has(propId)) {
						courseMap.set(propId, []);
					}
					courseMap.get(propId)!.push(pc);
				});

				const amenityMap = new Map(
					amenitiesData.map((amen: PropertyAmenities) => [
						amen.propertyId,
						amen,
					])
				);

				const mergedProperties = propertiesData.map(
					(property: PropertyProps) => {
						const location = locationMap.get(property.uniqueId);
						const reviews = reviewMap.get(property.uniqueId) || [];
						const propertyCourses = courseMap.get(property._id) || [];
						const amenity = amenityMap.get(property.uniqueId);
						const mergedCourses = mergeCourseData(
							propertyCourses,
							allCoursesData
						);

						return {
							uniqueId: property.uniqueId,
							property_name: property?.property_name || "",
							featured_image: property?.featured_image || [],
							category: getCategoryById(property?.category) || "",
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
							reviews: reviews,
							amenities: amenity?.selectedAmenities?.[0],
							courses: mergedCourses.map((course: MergedCourse) => ({
								property_id: course.property_id,
								image: course?.image || [],
								course_name: course?.course_name || "",
								course_level:
									typeof course?.course_level === "string"
										? getCategoryById(course.course_level)
										: "",
								course_type: getCategoryById(course?.course_type) || "",
								course_format: getCategoryById(course?.course_format) || "",
								duration: course?.duration || "",
								course_short_name: course?.course_short_name || "",
								certification_type: Array.isArray(course?.certification_type)
									? course.certification_type
											.map((id) => getCategoryById(id))
											.filter(Boolean)
											.join(", ")
									: typeof course?.certification_type === "string"
									? getCategoryById(course.certification_type)
									: "",
							})),
						};
					}
				);

				setAllProperties(mergedProperties);
				setDataLoaded(true);
			}
		} catch (error) {
			console.log("Unexpected error in getAllPropertyDetails:", error);
		} finally {
			setLoading(false);
		}
	}, [getCategoryById]);

	useEffect(() => {
		getAllPropertyDetails();
	}, [getAllPropertyDetails]);

	useEffect(() => {
		const handleOpenModal = () => setModalOpen(true);
		const handleDeselectAll = () => {
			setSelectedProperties([]);
			router.push("/compare/select");
		};

		window.addEventListener("openCompareModal", handleOpenModal);
		window.addEventListener("deselectAll", handleDeselectAll);

		return () => {
			window.removeEventListener("openCompareModal", handleOpenModal);
			window.removeEventListener("deselectAll", handleDeselectAll);
		};
	}, [router]);

	// Direct URL navigation functions
	const navigateToCompare = useCallback(
		(properties: PropertyProps[]) => {
			if (properties.length === 0) {
				router.push("/compare/select");
			} else {
				const slugs = properties.map((prop) => prop.property_slug).join("-vs-");
				router.push(`/compare/${slugs}`);
			}
		},
		[router]
	);

	const handleSetSelectedProperties = useCallback(
		(properties: PropertyProps[]) => {
			setSelectedProperties(properties);
			navigateToCompare(properties);
		},
		[navigateToCompare]
	);

	const removeProperty = useCallback(
		(property: PropertyProps) => {
			const updated = selectedProperties.filter(
				(p) => p.uniqueId !== property.uniqueId
			);
			setSelectedProperties(updated);
			navigateToCompare(updated);
		},
		[selectedProperties, navigateToCompare]
	);

	const handleModalClose = useCallback(() => {
		setModalOpen(false);
		if (selectedProperties.length === 0) {
			router.push("/compare/select");
		}
	}, [selectedProperties.length, router]);

	const SaveCompare = useCallback(async () => {
		try {
			const user = await getProfile();
			const properties = selectedProperties.map((item) => item.uniqueId);
			const payload = { userId: user?.uniqueId, properties };

			if (properties.length > 0) {
				const response = await API.post(`/compare`, payload);
				console.log(response.data.message);
			}
		} catch (error) {
			console.log(error);
		}
	}, [selectedProperties]);

	const hasSavedCompare = useRef(false);

	useEffect(() => {
		if (!hasSavedCompare.current && selectedProperties.length > 0) {
			SaveCompare();
			hasSavedCompare.current = true;
		}
	}, [SaveCompare, selectedProperties]);

	if (loading) {
		return <CompareLoader />;
	}

	return (
		<div className="min-h-screen bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div>
					<Breadcrumb items={[{ label: "Compare" }]} />
				</div>
			</div>
			<div className="max-w-7xl mx-auto px-6 py-10">
				<div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{selectedProperties.length === 0 &&
							// Show empty slots when no properties selected
							Array.from({ length: 3 }).map((_, index) => (
								<MainGridCard
									key={`empty-${index}`}
									title="Add College"
									onClick={() => setModalOpen(true)}
									index={index}
								/>
							))}
					</div>
				</div>

				{/* Modal */}
				{modalOpen && (
					<CompareModal
						allProperties={allProperties}
						selectedProperties={selectedProperties}
						onClose={handleModalClose}
						setSelectedProperties={handleSetSelectedProperties}
					/>
				)}

				{/* Basic Details Table - Show when properties are selected */}
				{selectedProperties.length > 0 && (
					<div>
						<BasicDetailTable
							selectedProperties={selectedProperties}
							removeProperty={removeProperty}
						/>
					</div>
				)}

				{selectedProperties.length >= 2 && (
					<div className="mb-20">
						<ComparisonTable selectedProperties={selectedProperties} />

						{/* Visit Links Row */}
						<div className="bg-white rounded-b-2xl shadow-sm border-x border-b border-purple-100 overflow-hidden">
							<div className="w-full overflow-x-auto">
								<table className="w-full border-collapse">
									<tbody>
										<tr className="bg-gradient-to-r from-purple-50 to-purple-100">
											<td className="text-left p-4 font-semibold text-gray-800 border-r border-purple-200 min-w-[160px] text-sm">
												Visit College
											</td>
											{selectedProperties.map((prop, idx) => (
												<td
													key={idx}
													className="text-center p-4 border-r border-purple-200 last:border-r-0 min-w-[200px]"
												>
													<Link
														href={`/${generateSlug(prop.category)}/${
															prop.property_slug
														}`}
														className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg text-sm"
													>
														Visit
														<LuLink />
													</Link>
												</td>
											))}
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default CompareProperties;
