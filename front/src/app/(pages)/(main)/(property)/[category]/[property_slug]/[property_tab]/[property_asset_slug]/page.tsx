"use client";
import API from "@/context/API";
import {
  generateSlug,
  getErrorResponse,
  isDateActive,
  mergeCourseData,
  transformWorkingHours,
} from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import { CategoryProps, CourseProps } from "@/types/Types";
import { AxiosResponse } from "axios";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBars, FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
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
import Overview from "../_property_components/tabs/Overview";
import GalleryTab from "../_property_components/tabs/GalleryTab";
import CertificationTab from "../_property_components/tabs/CertificationTab";
import WorkingHoursTab from "../_property_components/tabs/WorkingHoursTab";
import FaqsTab from "../_property_components/tabs/FaqsTab";
import AmenitiesTab from "../_property_components/tabs/AmenitiesTab";
import TeachersTab from "../_property_components/tabs/TeachersTab";
import CouponsTab from "../_property_components/tabs/CouponsTab";
import HiringTab from "../_property_components/tabs/HiringTab";
import ReviewsTab from "../_property_components/tabs/ReviewsTab";
import AccommodationTab from "../_property_components/tabs/AccomodationTab";
import CoursesTab from "../_property_components/tabs/Courses";
import PropertyCourseDetails from "./_property_asset_tab/PropertyCourse";
import { getProfile } from "@/context/getAssets";
import { UserProps } from "@/types/UserTypes";
import TabLoading from "@/ui/loader/component/TabLoading";

export default function Page() {
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
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property_slug]);

  const getCategories = useCallback(async () => {
    try {
      const response = await API.get(`/category`);
      setCategories(response.data);
    } catch (error) {
      getErrorResponse(error, true);
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

      const uniqueId = propertyData.uniqueId;
      const objectId = propertyData?._id;

      const requests = [
        API.get(`/property/location/${uniqueId}`),
        API.get(`/review/property/${uniqueId}`),
        API.get(`/property/property-course/${objectId}`),
        API.get(`/course`),
        API.get(`/property/gallery/${objectId}`),
        API.get(`/accomodation/${objectId}`),
        API.get(`/property/amenities/${uniqueId}`),
        API.get(`/certifications/${objectId}`),
        API.get(`/business-hours/${uniqueId}`),
        API.get(`/teacher/property/${objectId}`),
        API.get(`/property/faq/${uniqueId}`),
        API.get(`/coupons/property/${uniqueId}`),
        API.get(`/hiring/${uniqueId}`),
      ];

      const [
        locRes,
        reviewRes,
        propertyCourseRes,
        allCourseRes,
        galleryRes,
        accomodationRes,
        amenityRes,
        certiRes,
        hoursRes,
        teacherRes,
        faqRes,
        couponRes,
        hiringRes,
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
        certification:
          getData(certiRes, { certifications: [] })?.certifications ?? [],
        working_hours: transformWorkingHours(getData(hoursRes, [])),
        teachers: getData(teacherRes, []),
        faqs: getData(faqRes, []),
        coupons: getData(couponRes, []),
        hiring: getData(hiringRes, []),
      };

      setProperty(finalData);
    } catch (error) {
      getErrorResponse(error, true);
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
        tab: <AccommodationTab property={property} />,
      },
      {
        id: "amenities",
        label: "Amenities",
        icon: LuSettings,
        show: Object.keys(property?.amenities || {})?.length > 0,
        tab: <AmenitiesTab property={property} />,
      },
      {
        id: "certifications",
        label: "Certifications",
        icon: LuAward,
        show: (property?.certification?.length || 0) > 0,
        tab: <CertificationTab property={property} />,
      },
      {
        id: "hours",
        label: "Working Hours",
        icon: LuClock,
        show: (property?.working_hours?.length || 0) > 0,
        tab: <WorkingHoursTab property={property} />,
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
        tab: (
          <ReviewsTab
            profile={profile}
            getProperty={getPropertyData}
            property={property}
          />
        ),
      },
      {
        id: "coupons",
        label: "Coupons",
        icon: LuBadgePercent,
        show: property?.coupons?.some((c) =>
          isDateActive(c.start_from, c.valid_upto)
        ),
        tab: <CouponsTab coupons={property?.coupons || []} />,
      },
      {
        id: "hiring",
        label: "Hiring",
        icon: LuBriefcase,
        show: property?.hiring?.some((c) =>
          isDateActive(c.start_date, c.end_date)
        ),
        tab: <HiringTab hiring={property?.hiring || []} />,
      },
    ],
    [property, getCategoryById, getPropertyData, profile]
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

  if (hasError) {
    notFound();
  }

  if (loading) return <TabLoading />;

  return (
    <div>
      <div className="sticky top-[60px] px-1 sm:rounded-t-lg md:static z-40 bg-(--primary-bg)  border-b border-(--border) shadow-custom">
        <div className="relative flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 z-20 bg-(--primary-bg) ps-3 pe-2 transition md:hidden"
          >
            <FaBars className="text-(--text-color) h-5 w-5" />
          </button>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute cursor-pointer left-0 z-10 p-2 bg-(--secondary-bg) shadow-md rounded-full hover:opacity-80 transition"
            >
              <FaChevronLeft className="text-(--text-color)" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto hide-scrollbar px-14 md:px-16 "
          >
            {tabs.map((tab) => {
              if (!tab?.show) return;
              return (
                <Link
                  href={`/${generateSlug(category)}/${generateSlug(
                    property_slug
                  )}/${generateSlug(tab.id)}`}
                  key={tab.id}
                  className={`relative py-3 px-3 whitespace-nowrap cursor-pointer font-medium heading-sm transition-colors duration-200  flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "text-(--main)"
                      : "text-(--text-color) hover:text-(--main)"
                  } group`}
                >
                  <tab.icon
                    className={`${
                      activeTab === tab.id
                        ? "text-(--main)"
                        : "text-(--text-color) group-hover:text-(--main)"
                    }`}
                  />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-(--main)"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute cursor-pointer right-0 z-10 p-2  bg-(--secondary-bg) shadow-md rounded-full hover:opacity-80 transition"
            >
              <FaChevronRight className="text-(--text-color)" />
            </button>
          )}
        </div>
      </div>
      <div className="bg-(--primary-bg) sm:rounded-b-lg shadow-custom overflow-hidden">
        {/* {renderTab()} */}
        <PropertyCourseDetails />
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative bg-(--secondary-bg) text-(--text-color-emphasis) w-full p-6 overflow-y-auto">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-2 rounded-md text-(--main) hover:bg-(--main-light)"
            >
              <FaTimes />
            </button>

            <h3 className="sub-heading font-semibold mb-4">Menu</h3>
            <nav className="space-y-3">
              {tabs.map((tab) => (
                <Link
                  href={`/${generateSlug(category)}/${generateSlug(
                    property_slug
                  )}/${generateSlug(tab.id)}`}
                  key={tab.id}
                  className={`flex items-center gap-2 w-full text-left py-2 px-3 rounded-custom font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-(--main-light) text-(--main)"
                      : "text-(--text-color) bg-(--primary-bg)"
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                >
                  <tab.icon />
                  {tab.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
