"use client";
import PropertyFilters from "@/components/property_filters/PropertyFilters";
import API from "@/context/API";
import {
  getAverageRating,
  getErrorResponse,
  mergeCourseData,
} from "@/context/Callbacks";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import {
  PropertyCourseProps,
  PropertyProps,
  PropertyReviewProps,
} from "@/types/PropertyTypes";
import { CourseProps } from "@/types/Types";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import React, { useCallback, useEffect, useState } from "react";
type MergedCourse = PropertyCourseProps & Partial<CourseProps>;

export default function CoursePropertDetails({
  course,
}: {
  course: CourseProps | null;
}) {
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [propertyLoading, setPropertyLoading] = useState(true);
  const { getCategoryById } = useGetAssets();

  const getProperties = useCallback(async () => {
    if (!course?._id) return;

    setPropertyLoading(true);
    try {
      const results = await Promise.allSettled([
        API.get(`/related/property/course/${course._id}?limit=20`),
        API.get(`/review`),
        API.get(`/property-course/course/${course._id}`),
        API.get(`/course`),
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
          ...property,
          academic_type: getCategoryById(property?.academic_type) || "",
          property_type: getCategoryById(property?.property_type) || "",
          approved_by:
            property?.approved_by?.map((item) => getCategoryById(item)) || [],
          affiliated_by:
            property?.affiliated_by?.map((item) => getCategoryById(item)) || [],
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
  }, [course?._id, getCategoryById]);
  useEffect(() => {
    getProperties();
  }, [getProperties]);

  if (propertyLoading) return <InsitutesLoader />;
  return (
    <div className="">
      <PropertyFilters
        allProperties={properties}
        propertyLoading={propertyLoading}
        foundfor={course?.course_name || ""}
      />
    </div>
  );
}
