"use client";

import { useCallback, useEffect, useState } from "react";
import InfoCard from "@/ui/cards/InfoCard";
import ListItem from "@/ui/list/ListItem";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { BiAward, BiBarChart } from "react-icons/bi";
import { FiZap } from "react-icons/fi";
import { useParams } from "next/navigation";
import { CategoryProps, CourseProps } from "@/types/Types";
import {
	getAverageRating,
	getErrorResponse,
	mergeCourseData,
	safeArray,
} from "@/context/Callbacks";
import API from "@/context/API";
import PropertyFilters from "@/components/property_filters/PropertyFilters";
import {
	PropertyCourseProps,
	PropertyProps,
	PropertyReviewProps,
} from "@/types/PropertyTypes";
import Image from "next/image";
import HeadingLine from "@/ui/headings/HeadingLine";
import CourseEnquiryForm from "./_course_compoents/CourseEnquiryForm";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { UserProps } from "@/types/UserTypes";
import { getProfile } from "@/context/getAssets";
import CourseDetailSkeleton from "@/ui/loader/page/courses/CourseDetailSkeleton";

type MergedCourse = PropertyCourseProps & Partial<CourseProps>;

const CourseDetails = () => {
	const { course_slug } = useParams();
	const [mainCourse, setMainCourse] = useState<CourseProps | null>(null);
	const [loading, setLoading] = useState(true);
	const [properties, setProperties] = useState<PropertyProps[]>([]);
	const [category, setCategory] = useState<CategoryProps[]>([]);
	const [propertyLoading, setPropertyLoading] = useState(true);
	const [profile, setProfile] = useState<UserProps | null>(null);

	const getProfileUser = useCallback(async () => {
		try {
			const data = await getProfile();
			setProfile(data);
		} catch (error) {
			getErrorResponse(error);
		}
	}, []);

	useEffect(() => {
		getProfileUser();
	}, [getProfileUser]);

	const getCategoryById = useCallback(
		(id: string) => {
			const cat = category?.find((item) => item._id === id);
			return cat?.category_name;
		},
		[category],
	);

	const getCourses = useCallback(async () => {
		setLoading(true);

		try {
			const results = await Promise.allSettled([
				API.get<CourseProps>(`/course/seo/${course_slug}`), // now returns single course
				API.get<{ _id: string; best_for: string }[]>(`/best-for/all`),
				API.get<{ _id: string; course_eligibility: string }[]>(
					`/course-eligibility/all`,
				),
				API.get<CategoryProps[]>(`/category`),
			]);

			const [courseRes, bestForRes, courseEligibilityRes, categoryRes] =
				results;
			if (courseRes.status !== "fulfilled") {
				console.error("Failed to fetch course:", courseRes.reason);
				return;
			}

			const course = courseRes.value.data;
			const bestForData =
				bestForRes.status === "fulfilled" ? bestForRes.value.data : [];
			const courseEligibilityData =
				courseEligibilityRes.status === "fulfilled"
					? courseEligibilityRes.value.data
					: [];
			const categoryData =
				categoryRes.status === "fulfilled" ? categoryRes.value.data : [];
			setCategory(categoryData);

			// Best For map
			const bestForMap = new Map<string, string>();
			bestForData.forEach((r) => bestForMap.set(r._id, r.best_for));

			// Course Eligibility map
			const courseEligibilityMap = new Map<string, string>();
			courseEligibilityData.forEach((k) =>
				courseEligibilityMap.set(k._id, k.course_eligibility),
			);

			// Category map
			const categoryMap = new Map<string, string>();
			categoryData.forEach((c) => categoryMap.set(c._id, c.category_name));

			// ⭐ DIRECT MATCHING (no mapping loop needed)
			const populatedCourse: CourseProps = {
				...course,
				best_for: (course.best_for || [])
					.map((id) => bestForMap.get(id))
					.filter(Boolean) as string[],

				course_eligibility: (course.course_eligibility || [])
					.map((id: any) => courseEligibilityMap.get(id))
					.filter(Boolean) as string[],

				course_type: categoryMap.get(course.course_type) ?? course.course_type,
				degree_type: categoryMap.get(course.degree_type) ?? course.degree_type,
				program_type:
					categoryMap.get(course.program_type) ?? course.program_type,
			};

			setMainCourse(populatedCourse);
		} catch (error) {
			getErrorResponse(error, true);
		} finally {
			setLoading(false);
		}
	}, [course_slug]);

	useEffect(() => {
		getCourses();
	}, [getCourses]);

	const getProperties = useCallback(async () => {
		if (!mainCourse?._id) return;

		setPropertyLoading(true);
		try {
			const results = await Promise.allSettled([
				API.get(`/related/property/course/${mainCourse._id}?limit=20`),
				API.get(`/review`),
				API.get(`/property-course/course/${mainCourse._id}`),
				API.get(`/course/${mainCourse._id}`),
			]);

			const [propertyRes, reviewRes, propertyCourseRes, allCourseRes] = results;

			if (
				propertyRes.status === "fulfilled" &&
				reviewRes.status === "fulfilled" &&
				propertyCourseRes.status === "fulfilled" &&
				allCourseRes.status === "fulfilled"
			) {
				// 👁 Log response
				const rawProperties = propertyRes?.value?.data;

				const propertiesArray = Array.isArray(rawProperties)
					? rawProperties
					: Array.isArray(rawProperties?.data)
						? rawProperties.data
						: Array.isArray(rawProperties?.properties)
							? rawProperties.properties
							: [];

				const propertiesData = propertiesArray.filter(
					(item: PropertyProps) => item?.status === "Active",
				);

				// others unchanged…
				const reviewsData = reviewRes?.value?.data || [];
				const propertyCoursesData =
					safeArray(propertyCourseRes?.value?.data) || [];
				const allCoursesData = safeArray(allCourseRes?.value?.data) || [];

				const mergedProperties = propertiesData.map(
					(property: PropertyProps) => {
						const reviews = reviewsData.filter(
							(rev: PropertyReviewProps) => rev.property_id === property._id,
						);

						const propertyCourses = propertyCoursesData.filter(
							(pc: PropertyCourseProps) => pc.property_id === property._id,
						);

						const mergedCourses = mergeCourseData(
							propertyCourses,
							allCoursesData,
						);

						return {
							uniqueId: property._id,
							property_name: property?.property_name || "",
							featured_image: property?.featured_image || [],
							category: getCategoryById(property?.category) || "",
							property_type: getCategoryById(property?.property_type) || "",
							est_year: property?.est_year || "",
							property_slug: property?.property_slug || "",
							property_logo: property?.property_logo || [],
							property_description: property?.property_description || "",
							property_city: property?.property_city || "",
							property_state: property?.property_state || "",
							property_country: property?.property_country || "",
							reviews: reviews || [],
							average_rating: getAverageRating(reviews) || 0,
							courses: mergedCourses?.map((course: MergedCourse) => ({
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

				mergedProperties.sort(
					(a: PropertyProps, b: PropertyProps) =>
						(b?.average_rating || 0) - (a?.average_rating || 0),
				);

				setProperties(mergedProperties);
			}
		} catch (error) {
			getErrorResponse(error, true);
			setProperties([]);
		} finally {
			setPropertyLoading(false);
		}
	}, [mainCourse?._id, getCategoryById]);

	useEffect(() => {
		getProperties();
	}, [getProperties]);

	const imageSrc = mainCourse?.image?.[0]
		? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${mainCourse.image[0]}`
		: "/img/default-images/campusaim-courses-featured.png";

	console.log(mainCourse);

	if (loading)
		return (
			<>
				<CourseDetailSkeleton />
				<InsitutesLoader />
			</>
		);

	return (
		<div className="bg-(--secondary-bg) text-(--text-color) py-6 px-2 sm:px-8">
			<div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="order-1 lg:order-2">
					<div className=" bg-(--primary-bg) rounded-custom overflow-hidden shadow-custom sticky top-28">
						<div className="relative w-full aspect-2/1">
							<Image
								src={imageSrc}
								alt={mainCourse?.course_name || "Course Image"}
								fill
								className="w-full object-cover aspect-16/10"
							/>
							<span className="absolute bottom-4 left-4 px-3 py-1 bg-(--main-light) text-(--main-emphasis) text-sm font-medium rounded-custom shadow-custom">
								{mainCourse?.course_type}
							</span>
						</div>

						<div className="p-5">
							<div className="flex items-center mb-2">
								<div className="ml-3">
									<h1 className="heading font-semibold text-(--text-color-emphasis)">
										{mainCourse?.course_name}
									</h1>
								</div>
							</div>

							<div className="md:col-span-2 mt-4 gap-y-4">
								<ButtonGroup
									label="Send Enquiry"
									type="submit"
									className="w-full"
									disable={false}
									href="#enquiry"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* MAIN CONTENT — DESKTOP FIRST (order-2 on mobile) */}
				<div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
					<h1 className="heading font-extrabold text-(--text-color-emphasis) mb-4 hidden md:block">
						{mainCourse?.course_name}
					</h1>

					{/* Course Information */}
					<div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
						<HeadingLine title="Course Information" />

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<InfoCard
								Icon={BiBarChart}
								title="Degree Type"
								value={mainCourse?.degree_type || ""}
							/>
							<InfoCard
								Icon={BiAward}
								title="Program Type"
								value={mainCourse?.program_type || ""}
							/>
							<InfoCard
								Icon={FiZap}
								title="Course Type"
								value={mainCourse?.course_type || ""}
							/>
						</div>
					</div>

					{/* Best For & Coure Eligibility */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
							<HeadingLine title="Coure Eligibility" />
							<ul className="space-y-3">
								{mainCourse?.course_eligibility.map((item: any, index: any) => (
									<ListItem key={index} text={item} type="include" />
								))}
							</ul>
						</div>

						<div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
							<HeadingLine title="Best For" />
							<ul className="space-y-3">
								{mainCourse?.best_for.map((item, index) => (
									<ListItem key={index} text={item} type="include" />
								))}
							</ul>
						</div>
					</div>

					{/* Description */}
					<div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
						<HeadingLine title="Overview" />
						<ReadMoreLess html={mainCourse?.description || ""} />
					</div>
					<CourseEnquiryForm course={mainCourse} profile={profile} />
				</div>
			</div>
			<div className="">
				<PropertyFilters
					allProperties={properties}
					propertyLoading={propertyLoading}
				/>
			</div>
		</div>
	);
};

export default CourseDetails;
