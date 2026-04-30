"use client";

import API from "@/context/API";
import {
  generateSlug,
  getErrorResponse,
  mergeCourseData,
  shuffleArray,
} from "@/context/Callbacks";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import {
  PropertyCourseProps,
  PropertyLocationProps,
  PropertyProps,
  PropertyReviewProps,
} from "@/types/PropertyTypes";
import { CourseProps } from "@/types/Types";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export type MergedCourse = PropertyCourseProps & Partial<CourseProps>;

export default function useGetAllProperties({
  catFilter,
  isShuffle = false,
}: {
  catFilter?: string;
  isShuffle?: boolean;
}) {
  const { allCategories, getCategoryById } = useGetAssets();

  const {
    data: allProperties = [],
    isLoading: propertiesLoading,
    error,
  } = useQuery<PropertyProps[]>({
    queryKey: ["all-properties-details", allCategories?.length],
    queryFn: async () => {
      const results = await Promise.allSettled([
        API.get(`/property`),
        API.get(`/locations`),
        API.get(`/review`),
        API.get(`/property-course`),
        API.get(`/course`),
      ]);

      const [
        propertyRes,
        locationRes,
        reviewRes,
        propertyCourseRes,
        allCourseRes,
      ] = results.map((result) =>
        result.status === "fulfilled" ? result.value.data : [],
      );

      const propertiesData = (propertyRes || []).filter(
        (item: PropertyProps) => item?.status === "Active",
      );

      const locationsData = locationRes || [];
      const reviewsData = reviewRes || [];
      const propertyCoursesData = propertyCourseRes || [];
      const allCoursesData = allCourseRes || [];

      const merged = propertiesData.map((property: PropertyProps) => {
        const location = locationsData.find(
          (loc: PropertyLocationProps) => loc.property_id === property._id,
        );
        const reviews = reviewsData.filter(
          (rev: PropertyReviewProps) =>
            String(rev.property_id) === property._id,
        );
        const propertyCourses = propertyCoursesData.filter(
          (pc: PropertyCourseProps) => pc.property_id === property._id,
        );
        const mergedCourses = mergeCourseData(propertyCourses, allCoursesData);

        return {
          ...property,
          property_name: property?.property_name || "",
          featured_image: property?.featured_image || [],
          academic_type: getCategoryById(property?.academic_type) || "",
          property_type: getCategoryById(property?.property_type) || "",
          approved_by: property?.approved_by?.map((item) =>
            getCategoryById(item),
          ),
          affiliated_by: property?.affiliated_by?.map((item) =>
            getCategoryById(item),
          ),
          est_year: property?.est_year || "",
          property_slug: property?.property_slug || "",
          property_logo: property?.property_logo || [],
          property_description: property?.property_description || "",
          address: location?.property_address || "",
          pincode: location?.property_pincode || 0,
          city: location?.property_city || "",
          state: location?.property_state || "",
          country: location?.property_country || "",
          property_city: location?.property_city || "",
          property_state: location?.property_state || "",
          property_country: location?.property_country || "",
          reviews: reviews || [],
          courses: (mergedCourses as MergedCourse[]).map((course) => ({
            property_id: course.property_id,
            image: course?.image || [],
            course_name: course?.course_name || "",
            course_level: getCategoryById(course?.course_level) || "",
            course_type: getCategoryById(course?.course_type) || "",
            course_format: getCategoryById(course?.course_format) || "",
            duration: course?.duration || "",
          })),
        } as PropertyProps;
      });

      return merged;
    },
    enabled: !!allCategories && allCategories.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  if (error) {
    getErrorResponse(error, true);
  }

  const processedProperties = useMemo(() => {
    if (!allProperties || allProperties.length === 0) return [];

    let filtered = allProperties;
    if (catFilter) {
      filtered = allProperties.filter(
        (prop) => generateSlug(prop?.academic_type) === generateSlug(catFilter)
      );
    }

    return isShuffle ? shuffleArray([...filtered]) : filtered;
  }, [allProperties, catFilter, isShuffle]);

  return { allProperties: processedProperties, propertiesLoading };
}