"use client";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import {
	CategoryProps,
	CourseProps,
	PropertyCourse,
	PropertyProps,
} from "@/types/types";
import { FaBars, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { generateSlug, transformWorkingHours } from "@/contexts/Callbacks";
import Overview from "./_property_components/tabs/OverviewTab";
import API from "@/contexts/API";
import AmenitiesTab from "./_property_components/tabs/AmenitiesTab";
import WorkingHoursTab from "./_property_components/tabs/WorkingHoursTab";
import GalleryTab from "./_property_components/tabs/GalleryTab";
import { AxiosError, AxiosResponse } from "axios";
import CertificationTab from "./_property_components/tabs/CertificationTab";
import FaqsTab from "./_property_components/tabs/FaqsTab";
import TeachersTab from "./_property_components/tabs/TeachersTab";
import ReviewsTab from "./_property_components/tabs/ReviewTab";
import AccommodationTab from "./_property_components/tabs/AccomodationTab";
import CoursesTab from "./_property_components/tabs/CourseTab";
import CouponsTab from "./_property_components/tabs/CouponsTab";
import HiringTab from "./_property_components/tabs/HiringTab";
import {
	LuAward,
	LuBadgePercent,
	LuBed,
	LuBookOpen,
	LuBriefcase,
	LuCircleHelp,
	LuClock,
	LuImage,
	LuInfo,
	LuSettings,
	LuStar,
	LuUsers,
} from "react-icons/lu";
import Skeleton from "react-loading-skeleton";

const mergeCourseData = (
	propertyCourses: PropertyCourse[] | undefined,
	courses: CourseProps[]
) => {
	if (!Array.isArray(propertyCourses)) {
		console.warn("propertyCourses is not an array:", propertyCourses);
		return [];
	}

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

const Property = () => {
	const { category, property_slug, property_tab } = useParams<{
		property_slug: string;
		property_tab?: string;
		category: string;
	}>();

	const [activeTab, setActiveTab] = useState("overview");
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [property, setProperty] = useState<PropertyProps | null>(null);
	const [categories, setCategories] = useState<CategoryProps[]>([]);
	const [hasError, setHasError] = useState(false);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	const getCategoryById = useCallback(
		(id: string | number) => {
			const cat = categories.find(
				(item) =>
					Number(item.uniqueId) === Number(id) ||
					String(item?._id) === String(id)
			);
			return cat?.category_name;
		},
		[categories]
	);

	const getProperty = useCallback(async () => {
		try {
			const response = await API.get(`/property/slug/${property_slug}`);
			if (!response.data) {
				setHasError(true);
				return;
			}
			return response.data;
		} catch (error: unknown) {
			const err = error as AxiosError<{ error: string }>;
			console.log(err.response?.data.error);
		}
	}, [property_slug]);

	const getCategories = useCallback(async () => {
		try {
			const response = await API.get(`/category`);
			setCategories(response.data);
		} catch (error) {
			console.log(error);
		}
	}, []);

	useEffect(() => {
		getCategories();
	}, [getCategories]);

	const getPropertyData = useCallback(async () => {
		setLoading(true);
		try {
			const propertyData = await getProperty();

			if (!propertyData || !propertyData.uniqueId) {
				console.warn("Property Not Found.");
				return;
			}

			if (propertyData?.status !== "Active") {
				notFound();
				return;
			}

			const uniqueId = propertyData._id;

			const requests = [
				API.get(`/property/location/${uniqueId}`),
				API.get(`/review/property/${uniqueId}`),
				API.get(`/property/property-course/${propertyData?._id}`),
				API.get(`/course`),
				API.get(`/property/gallery/${uniqueId}`),
				API.get(`/accomodation/${uniqueId}`),
				API.get(`/property/amenities/${uniqueId}`),
				API.get(`/teacher/property/${uniqueId}`),
				API.get(`/property/faq/${uniqueId}`),
			];

			const [
				locRes,
				reviewRes,
				propertyCourseRes,
				allCourseRes,
				galleryRes,
				accomodationRes,
				amenityRes,
				teacherRes,
				faqRes,
			] = await Promise.allSettled(requests);

			const getData = <T,>(
				result: PromiseSettledResult<AxiosResponse<T>>,
				fallback: T
			): T => (result.status === "fulfilled" ? result.value.data : fallback);

			const mergedCourses: CourseProps[] =
				propertyCourseRes.status === "fulfilled" &&
				allCourseRes.status === "fulfilled"
					? (mergeCourseData(
							propertyCourseRes.value?.data,
							allCourseRes.value?.data
					  ) as unknown as CourseProps[])
					: [];

			const locationData = getData(locRes, {});

			const finalData: PropertyProps = {
				...propertyData,
				address: locationData.property_address,
				pincode: locationData.property_pincode,
				city: locationData.property_city,
				state: locationData.property_state,
				country: locationData.property_country,
				reviews: getData(reviewRes, {}),
				courses: mergedCourses,
				gallery: getData(galleryRes, []),
				accomodation: getData(accomodationRes, []),
				amenities:
					getData(amenityRes, { selectedAmenities: [{}] })
						.selectedAmenities?.[0] || {},
				teachers: getData(teacherRes, []),
				faqs: getData(faqRes, []),
			};

			setProperty(finalData);
		} catch (error) {
			console.error("Failed to fetch property data:", error);
		} finally {
			setLoading(false);
		}
	}, [getProperty]);

	useEffect(() => {
		getPropertyData();
	}, [getPropertyData]);

	const tabs = useMemo(
		() => [
			{
				id: "overview",
				label: "Overview",
				icon: LuInfo,
				show: true,
				tab: <Overview property={property} getCategoryById={getCategoryById} />,
			},
			{
				id: "courses",
				label: "Courses",
				icon: LuBookOpen,
				show: (property?.courses?.length || 0) > 0,
				tab: (
					<CoursesTab
						getCategoryById={getCategoryById}
						courses={property?.courses || []}
					/>
				),
			},
			{
				id: "gallery",
				label: "Gallery",
				icon: LuImage,
				show: (property?.gallery?.length || 0) > 0,
				tab: <GalleryTab property={property} />,
			},
			{
				id: "accomodation",
				label: "Accomodation",
				icon: LuBed,
				show: (property?.accomodation?.length || 0) > 0,
				tab: <AccommodationTab accommodations={property?.accomodation || []} />,
			},
			{
				id: "amenities",
				label: "Amenities",
				icon: LuSettings,
				show: Object.keys(property?.amenities || {})?.length > 0,
				tab: <AmenitiesTab property={property} />,
			},
			{
				id: "teachers",
				label: "Teachers",
				icon: LuUsers,
				show: (property?.teachers?.length || 0) > 0,
				tab: <TeachersTab teachers={property?.teachers || []} />,
			},
			{
				id: "faq",
				label: "FAQ",
				icon: LuCircleHelp,
				show: (property?.faqs?.length || 0) > 0,
				tab: <FaqsTab faqs={property?.faqs || []} />,
			},
			{
				id: "reviews",
				label: "Reviews",
				icon: LuStar,
				show: true,
				tab: <ReviewsTab getProperty={getProperty} property={property} />,
			},
		],
		[property, getCategoryById, getProperty]
	);

	useEffect(() => {
		if (property_tab) {
			const matchedTab = tabs.find(
				(tab) => generateSlug(tab.id) === property_tab
			);
			if (!matchedTab) {
				router.push(
					`/${generateSlug(category)}/${generateSlug(property_slug)}/overview`
				);
			}
			if (matchedTab) setActiveTab(matchedTab.id);
		} else {
			setActiveTab("overview");
		}
	}, [property_tab, router, category, property_slug, tabs]);

	const checkForScrollPosition = () => {
		if (scrollRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
		}
	};

	useEffect(() => {
		checkForScrollPosition();
		const el = scrollRef.current;
		if (el) {
			el.addEventListener("scroll", checkForScrollPosition);
			window.addEventListener("resize", checkForScrollPosition);
		}
		return () => {
			if (el) el.removeEventListener("scroll", checkForScrollPosition);
			window.removeEventListener("resize", checkForScrollPosition);
		};
	}, []);

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const scrollAmount = 180;
			scrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	const renderTab = useCallback(() => {
		if (loading)
			return (
				<div className="p-6 space-y-6">
					<Skeleton width={150} height={28} className="mb-4" />
					<Skeleton height={150} className="rounded-xl mb-4" />
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
						<Skeleton height={100} className="rounded-lg" />
						<Skeleton height={100} className="rounded-lg" />
					</div>
					<div className="space-y-2 mb-4">
						<Skeleton height={20} />
						<Skeleton height={20} />
						<Skeleton height={20} />
					</div>
					<div className="grid grid-cols-3 md:grid-cols-4 gap-3">
						{Array.from({ length: 4 }).map((_, idx) => (
							<Skeleton key={idx} height={50} className="rounded-lg" />
						))}
					</div>
				</div>
			);

		const mainTab = tabs.find(
			(tab) => generateSlug(tab.id) === activeTab && tab?.show
		);
		if (!mainTab) {
			router.push(
				`/${generateSlug(category)}/${generateSlug(property_slug)}/overview`
			);
			return null;
		}
		return mainTab.tab;
	}, [activeTab, tabs, loading, router, category, property_slug]);

	if (hasError) {
		notFound();
	}

	return (
		<div className="max-w-6xl mx-auto">
			<div
				className="w-full z-30 bg-white border-b border-gray-200 
                sticky top-16 md:static sm:rounded-t-2xl sm:shadow-sm"
			>
				<div className="flex items-center relative">
					<button
						onClick={() => setSidebarOpen(true)}
						className="absolute left-2 z-20 p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition md:hidden"
					>
						<FaBars className="text-gray-700" />
					</button>{" "}
					{canScrollLeft && (
						<button
							onClick={() => scroll("left")}
							className="hidden md:flex absolute left-1 z-10 p-2 bg-white shadow-md rounded-full hover:bg-gray-100 transition"
						>
							<FaChevronLeft className="text-gray-600" />
						</button>
					)}{" "}
					<div
						ref={scrollRef}
						className="flex space-x-6 overflow-x-auto scrollbar-hide px-14 md:px-16"
					>
						{tabs.map((tab) => {
							if (!tab?.show) return;
							return (
								<Link
									href={`/${generateSlug(category)}/${generateSlug(
										property_slug
									)}/${generateSlug(tab.id)}`} // use tab.id
									key={tab.id}
									className={`relative py-3 px-3 whitespace-nowrap font-medium transition-colors duration-200
        ${
					activeTab === tab.id
						? "text-purple-600"
						: "text-gray-600 hover:text-purple-500"
				}`}
									onClick={() => setActiveTab(tab.id)}
								>
									{tab.label}
									{activeTab === tab.id && (
										<span className="absolute left-0 bottom-0 w-full h-[2px] bg-purple-600 rounded-full"></span>
									)}
								</Link>
							);
						})}
					</div>{" "}
					{canScrollRight && (
						<button
							onClick={() => scroll("right")}
							className="hidden md:flex absolute right-1 z-10 p-2 bg-white shadow-md rounded-full hover:bg-gray-100 transition"
						>
							<FaChevronRight className="text-gray-600" />
						</button>
					)}
				</div>
			</div>

			<div className="bg-white sm:rounded-b-2xl sm:shadow-sm  overflow-hidden">
				<div>{renderTab()}</div>
			</div>

			{/* Sidebar (Toggle Menu for Mobile) */}
			{sidebarOpen && (
				<div className="fixed inset-0 z-50 flex">
					{/* Overlay */}
					<div
						className="fixed inset-0 bg-black bg-opacity-50"
						onClick={() => setSidebarOpen(false)}
					></div>{" "}
					{/* Sidebar */}
					<div className="relative bg-white w-64 p-6 overflow-y-auto">
						<button
							onClick={() => setSidebarOpen(false)}
							className="absolute top-3 right-3 p-2 rounded-md bg-gray-100"
						>
							<FaTimes className="text-gray-700" />
						</button>{" "}
						<h3 className="text-lg font-semibold mb-4">Menu</h3>
						<nav className="space-y-3">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									className={`block w-full text-left py-2 px-3 rounded-md font-medium transition-colors
                    ${
											activeTab === tab.id
												? "bg-purple-50 text-purple-600"
												: "text-gray-700 hover:bg-gray-100"
										}`}
									onClick={() => {
										setActiveTab(tab.id);
										setSidebarOpen(false);
									}}
								>
									{tab.label}
								</button>
							))}
						</nav>
					</div>
				</div>
			)}
		</div>
	);
};

export default Property;
