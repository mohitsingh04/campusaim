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
      const cat = category?.find(
        (item) => item.uniqueId === Number(id) || item._id === id
      );
      return cat?.category_name;
    },
    [category]
  );

  const getCourses = useCallback(async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        API.get<CourseProps>(`/course/seo/${course_slug}`), // now returns single course
        API.get<{ _id: string; requirment: string }[]>(`/requirment/all`),
        API.get<{ _id: string; key_outcome: string }[]>(`/key-outcome/all`),
        API.get<CategoryProps[]>(`/category`),
      ]);

      const [courseRes, requirementsRes, keyOutcomesRes, categoryRes] = results;

      if (courseRes.status !== "fulfilled") {
        console.error("Failed to fetch course:", courseRes.reason);
        return;
      }

      const course = courseRes.value.data;
      const requirementsData =
        requirementsRes.status === "fulfilled"
          ? requirementsRes.value.data
          : [];
      const keyOutcomesData =
        keyOutcomesRes.status === "fulfilled" ? keyOutcomesRes.value.data : [];
      const categoryData =
        categoryRes.status === "fulfilled" ? categoryRes.value.data : [];
      setCategory(categoryData);

      // Requirements map
      const requirementMap = new Map<string, string>();
      requirementsData.forEach((r) => requirementMap.set(r._id, r.requirment));

      // Key Outcomes map
      const keyOutcomeMap = new Map<string, string>();
      keyOutcomesData.forEach((k) => keyOutcomeMap.set(k._id, k.key_outcome));

      // Category map
      const categoryMap = new Map<string, string>();
      categoryData.forEach((c) => categoryMap.set(c._id, c.category_name));

      // ⭐ DIRECT MATCHING (no mapping loop needed)
      const populatedCourse: CourseProps = {
        ...course,
        requirements: (course.requirements || [])
          .map((id) => requirementMap.get(id))
          .filter(Boolean) as string[],

        key_outcomes: (course.key_outcomes || [])
          .map((id) => keyOutcomeMap.get(id))
          .filter(Boolean) as string[],

        course_type: categoryMap.get(course.course_type) ?? course.course_type,
        course_level:
          categoryMap.get(course.course_level) ?? course.course_level,
        certification_type:
          categoryMap.get(course.certification_type) ??
          course.certification_type,
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
          (item: PropertyProps) => item?.status === "Active"
        );

        // others unchanged…
        const reviewsData = reviewRes?.value?.data || [];
        const propertyCoursesData =
          safeArray(propertyCourseRes?.value?.data) || [];
        const allCoursesData = safeArray(allCourseRes?.value?.data) || [];

        const mergedProperties = propertiesData.map(
          (property: PropertyProps) => {
            const reviews = reviewsData.filter(
              (rev: PropertyReviewProps) =>
                Number(rev.property_id) === property.uniqueId
            );

            const propertyCourses = propertyCoursesData.filter(
              (pc: PropertyCourseProps) => pc.property_id === property._id
            );

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
          }
        );

        mergedProperties.sort(
          (a: PropertyProps, b: PropertyProps) =>
            (b?.average_rating || 0) - (a?.average_rating || 0)
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
    : "/img/default-images/yp-yoga-courses.webp";

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

          {/* Retreat Information */}
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Retreat Information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <InfoCard
                Icon={BiBarChart}
                title="Difficulty"
                value={mainCourse?.course_level || ""}
              />
              <InfoCard
                Icon={BiAward}
                title="Certification"
                value={mainCourse?.certification_type || ""}
              />
              <InfoCard
                Icon={FiZap}
                title="Course Type"
                value={mainCourse?.course_type || ""}
              />
            </div>
          </div>

          {/* Outcomes & Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="What Will You Achieve" />
              <ul className="space-y-3">
                {mainCourse?.key_outcomes.map((item, index) => (
                  <ListItem key={index} text={item} type="include" />
                ))}
              </ul>
            </div>

            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Requirements" />
              <ul className="space-y-3">
                {mainCourse?.requirements.map((item, index) => (
                  <ListItem key={index} text={item} type="include" />
                ))}
              </ul>
            </div>
          </div>

          {/* What's Included */}
          {(mainCourse?.best_for?.length || 0) > 0 && (
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Who Can Do This Course" />
              <ul className="space-y-2">
                {mainCourse?.best_for.map((item, i) => (
                  <ListItem key={i} text={item} type="include" />
                ))}
              </ul>
            </div>
          )}

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
