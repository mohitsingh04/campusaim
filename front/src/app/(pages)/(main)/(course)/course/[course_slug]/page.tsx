"use client";

import { useCallback, useEffect, useState } from "react";
import InfoCard from "@/ui/cards/InfoCard";
import ListItem from "@/ui/list/ListItem";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { useParams } from "next/navigation";
import { CourseProps } from "@/types/Types";
import {
  getAverageRating,
  getErrorResponse,
  mergeCourseData,
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
import CourseDetailSkeleton from "@/ui/loader/page/courses/CourseDetailSkeleton";
import { AwardIcon, BarChartIcon, ClockIcon, ZapIcon } from "lucide-react";
import useGetAuthUser from "@/hooks/fetch-hooks/useGetAuthUser";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import FaqComponents from "@/ui/accordions/FaqComponents";
import FaqJsonSchema from "@/components/json_schemas/FaqJsonSchema";

type MergedCourse = PropertyCourseProps & Partial<CourseProps>;

const CourseDetails = () => {
  const { course_slug } = useParams();
  const [mainCourse, setMainCourse] = useState<CourseProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const { authUser } = useGetAuthUser();
  const { getCategoryById } = useGetAssets();

  const getCourses = useCallback(async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        API.get<CourseProps>(`/course/seo/${course_slug}`),
        API.get<{ _id: string; best_for: string }[]>(`/best-for/all`),
        API.get<{ _id: string; course_eligibility: string }[]>(
          `/course-eligibility/all`,
        ),
      ]);

      const [courseRes, bestForRes, courseEligibilityRes] = results;
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

      const bestForMap = new Map<string, string>();
      bestForData.forEach((r) => bestForMap.set(r._id, r.best_for));

      const courseEligibilityMap = new Map<string, string>();
      courseEligibilityData.forEach((k) =>
        courseEligibilityMap.set(k._id, k.course_eligibility),
      );

      const populatedCourse: CourseProps = {
        ...course,
        best_for: (course.best_for || [])
          .map((id) => bestForMap.get(id))
          .filter(Boolean) as string[],

        course_eligibility: (course.course_eligibility || [])
          .map((id: any) => courseEligibilityMap.get(id))
          .filter(Boolean) as string[],
        specialization: (course?.specialization || [])
          .map((item: string) => getCategoryById(item || ""))
          .filter(Boolean) as string[],
        course_type: getCategoryById(course.course_type) ?? course.course_type,
        degree_type: getCategoryById(course.degree_type) ?? course.degree_type,
        program_type:
          getCategoryById(course.program_type) ?? course.program_type,
      };

      setMainCourse(populatedCourse);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [course_slug, getCategoryById]);

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

      const propertyRes =
        results[0].status === "fulfilled" ? results[0].value?.data : [];
      const reviewsData =
        results[1].status === "fulfilled" ? results[1].value?.data : [];
      const propertyCoursesData =
        results[2].status === "fulfilled" ? results[2].value?.data || [] : [];
      const allCoursesData =
        results[3].status === "fulfilled" ? results[3].value?.data || [] : [];

      const rawProperties = propertyRes;
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

      const mergedProperties = propertiesData.map((property: PropertyProps) => {
        const reviews = Array.isArray(reviewsData)
          ? reviewsData.filter(
              (rev: PropertyReviewProps) => rev.property_id === property._id,
            )
          : [];

        const propertyCourses = Array.isArray(propertyCoursesData)
          ? propertyCoursesData.filter(
              (pc: PropertyCourseProps) => pc.property_id === property._id,
            )
          : [];

        const mergedCourses = mergeCourseData(propertyCourses, allCoursesData);

        return {
          uniqueId: property._id,
          property_name: property?.property_name || "",
          featured_image: property?.featured_image || [],
          academic_type: getCategoryById(property?.academic_type) || "",
          property_type: getCategoryById(property?.property_type) || "",
          approved_by:
            property?.approved_by?.map((item) => getCategoryById(item)) || [],
          affiliated_by:
            property?.affiliated_by?.map((item) => getCategoryById(item)) || [],
          est_year: property?.est_year || "",
          property_slug: property?.property_slug || "",
          property_logo: property?.property_logo || [],
          property_description: property?.property_description || "",
          property_city: property?.property_city || "",
          property_state: property?.property_state || "",
          property_country: property?.property_country || "",
          reviews: reviews,
          average_rating: getAverageRating(reviews) || 0,
          courses: (mergedCourses || []).map((course: MergedCourse) => ({
            property_id: course.property_id,
            image: course?.image || [],
            course_name: course?.course_name || "",
            course_level: getCategoryById(course?.course_level) || "",
            course_type: getCategoryById(course?.course_type) || "",
            course_format: getCategoryById(course?.course_format) || "",
            duration: course?.duration || "",
          })),
        };
      });
      mergedProperties.sort(
        (a: any, b: any) => (b?.average_rating || 0) - (a?.average_rating || 0),
      );

      setProperties(mergedProperties);
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

  const gridCount = [
    mainCourse?.specialization?.length,
    mainCourse?.course_eligibility?.length,
    mainCourse?.best_for?.length,
  ]?.filter(Boolean)?.length;

  if (loading)
    return (
      <>
        <CourseDetailSkeleton />
        <InsitutesLoader />
      </>
    );

  return (
    <div className="bg-(--secondary-bg) text-(--text-color) py-6 px-2 sm:px-8">
      <FaqJsonSchema
        faqs={mainCourse?.faqs || []}
        slug={mainCourse?.course_slug || ""}
      />
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
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-(--main-subtle) text-(--main-emphasis) text-sm font-medium rounded-custom shadow-custom">
                {mainCourse?.course_type}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-center mb-2">
                <div className="ml-3">
                  <h1 className="heading font-semibold text-(--text-color-emphasis)">
                    {mainCourse?.course_name}
                    {mainCourse?.course_short_name &&
                      ` - (${mainCourse?.course_short_name})`}
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

        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <h1 className="heading font-extrabold text-(--text-color-emphasis) mb-4 hidden md:block">
            {mainCourse?.course_name}
            {mainCourse?.course_short_name &&
              ` - (${mainCourse?.course_short_name})`}
          </h1>

          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Course Information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard
                Icon={ZapIcon}
                title="Course Type"
                value={mainCourse?.course_type || ""}
              />
              <InfoCard
                Icon={AwardIcon}
                title="Program Type"
                value={mainCourse?.program_type || ""}
              />
              <InfoCard
                Icon={BarChartIcon}
                title="Degree Type"
                value={mainCourse?.degree_type || ""}
              />
              <InfoCard
                Icon={ClockIcon}
                title="Duration"
                value={mainCourse?.duration || ""}
              />
            </div>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-${gridCount || 1} gap-6`}
          >
            {(mainCourse?.course_eligibility?.length || 0) > 0 && (
              <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
                <HeadingLine title="Coure Eligibility" />
                <ul className="space-y-3">
                  {mainCourse?.course_eligibility.map(
                    (item: any, index: any) => (
                      <ListItem key={index} text={item} type="include" />
                    ),
                  )}
                </ul>
              </div>
            )}
            {(mainCourse?.specialization?.length || 0) > 0 && (
              <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
                <HeadingLine title="Coure Specialization" />
                <ul className="space-y-3">
                  {mainCourse?.specialization?.map((item: any, index: any) => (
                    <ListItem key={index} text={item} type="include" />
                  ))}
                </ul>
              </div>
            )}

            {(mainCourse?.best_for?.length || 0) > 0 && (
              <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
                <HeadingLine title="Best For" />
                <ul className="space-y-3">
                  {mainCourse?.best_for.map((item, index) => (
                    <ListItem key={index} text={item} type="include" />
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Overview" />
            <ReadMoreLess html={mainCourse?.description || ""} />
          </div>
          {(mainCourse?.faqs?.length || 0) > 0 && (
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Frequently Asked Questions" />
              <FaqComponents faqs={mainCourse?.faqs || []} />
            </div>
          )}
          <CourseEnquiryForm course={mainCourse} profile={authUser} />
        </div>
      </div>
      <div className="">
        <PropertyFilters
          allProperties={properties}
          propertyLoading={propertyLoading}
          foundfor={mainCourse?.course_name || ""}
        />
      </div>
    </div>
  );
};

export default CourseDetails;
