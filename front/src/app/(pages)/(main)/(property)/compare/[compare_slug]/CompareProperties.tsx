"use client";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  PropertyAmenities,
  PropertyCourseProps,
  PropertyLocationProps,
  PropertyProps,
  PropertyRankProps,
  PropertyReviewProps,
} from "@/types/PropertyTypes";
import { getProfile } from "@/context/getAssets";
import ComparisonTable from "../_components/ComparisonTable";
import BasicDetailTable from "../_components/BasicDetailTable";
import CompareModal from "../_components/CompareModal";
import MainGridCard from "../_components/MainGridCard";
import {
  generateSlug,
  getErrorResponse,
  getSuccessResponse,
  mergeCourseData,
} from "@/context/Callbacks";
import { CategoryProps, CourseProps } from "@/types/Types";
import API from "@/context/API";
import ComparisonPageSkeleton from "@/ui/loader/page/institutes/CompareInstituteLoader";
import Link from "next/link";
import { LuLink } from "react-icons/lu";

type MergedCourse = PropertyCourseProps & Partial<CourseProps>;

const CompareProperties = ({ slugs }: { slugs?: string[] }) => {
  const [selectedProperties, setSelectedProperties] = useState<PropertyProps[]>(
    []
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [allProperties, setAllProperties] = useState<PropertyProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const router = useRouter();
  const [category, setCategory] = useState<CategoryProps[]>([]);

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
      getErrorResponse(error, true);
    }
  }, []);
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
        rankRes,
      ] = await Promise.allSettled([
        API.get(`/property`),
        API.get<PropertyLocationProps[]>(`/locations`),
        API.get(`/review`),
        API.get(`/property-course`),
        API.get(`/course`),
        API.get<PropertyAmenities[]>(`/amenities`),
        API.get<PropertyRankProps[]>(`/ranks`),
      ]);

      const allFulfilled =
        propertyRes.status === "fulfilled" &&
        locationRes.status === "fulfilled" &&
        reviewRes.status === "fulfilled" &&
        propertyCourseRes.status === "fulfilled" &&
        allCourseRes.status === "fulfilled" &&
        rankRes.status === "fulfilled" &&
        amenitiesRes.status === "fulfilled";

      if (!allFulfilled) return;

      // Extract values
      const propertiesData = propertyRes.value?.data || [];
      const locationsData = locationRes.value?.data || [];
      const reviewsData = reviewRes.value?.data || [];
      const propertyCoursesData = propertyCourseRes.value?.data || [];
      const allCoursesData = allCourseRes.value?.data || [];
      const amenitiesData = amenitiesRes.value?.data || [];
      const rankData = rankRes.value?.data || [];

      // Maps
      const locationMap = new Map(
        locationsData.map((loc: PropertyLocationProps) => [
          Number(loc.property_id),
          loc,
        ])
      );

      const rankMap = new Map(
        rankData.map((ran) => [String(ran.property_id), ran])
      );

      const reviewMap = new Map<number, PropertyReviewProps[]>();
      reviewsData.forEach((rev: PropertyReviewProps) => {
        const propId = Number(rev.property_id);
        if (!reviewMap.has(propId)) reviewMap.set(propId, []);
        reviewMap.get(propId)!.push(rev);
      });

      const courseMap = new Map<string, PropertyCourseProps[]>();
      propertyCoursesData.forEach((pc: PropertyCourseProps) => {
        const propId = String(pc.property_id);
        if (!courseMap.has(propId)) courseMap.set(propId, []);
        courseMap.get(propId)!.push(pc);
      });

      const amenityMap = new Map(
        amenitiesData.map((amen: PropertyAmenities) => [amen.propertyId, amen])
      );

      // Merge all data
      const mergedProperties = propertiesData.map((property: PropertyProps) => {
        const location = locationMap.get(property.uniqueId);
        const rank = rankMap.get(property._id);
        const reviews = reviewMap.get(property.uniqueId) || [];
        const propertyCourses = courseMap.get(property._id) || [];
        const amenity = amenityMap.get(property.uniqueId);

        const mergedCourses = mergeCourseData(propertyCourses, allCoursesData);

        return {
          _id: property?._id,
          uniqueId: property.uniqueId,
          property_name: property.property_name || "",
          featured_image: property.featured_image || [],
          category: getCategoryById(property.category) || "",
          property_type: getCategoryById(property.property_type) || "",
          est_year: property.est_year || "",
          property_slug: property.property_slug || "",
          property_logo: property.property_logo || [],
          property_description: property.property_description || "",
          rank: rank?.rank || 0,
          lastRank: rank?.lastRank || 0,
          address: location?.property_address || "",
          pincode: location?.property_pincode || 0,
          city: location?.property_city || "",
          state: location?.property_state || "",
          country: location?.property_country || "",
          property_city: location?.property_city || "",
          property_state: location?.property_state || "",
          property_country: location?.property_country || "",

          // Reviews
          reviews,

          // Amenities
          amenities: amenity?.selectedAmenities?.[0],

          // Courses
          courses: mergedCourses.map((course: MergedCourse) => ({
            property_id: course.property_id,
            image: course.image || [],
            course_name: course.course_name || "",
            course_level: getCategoryById(course.course_level) || "",
            course_type: getCategoryById(course.course_type) || "",
            course_format: getCategoryById(course.course_format) || "",
            duration: course.duration || "",
            course_short_name: course.course_short_name || "",
            certification_type:
              getCategoryById(course.certification_type || "") || "",
          })),
        };
      });

      // Sort by rank (higher first)
      const sortedProperties = [...mergedProperties].sort(
        (a, b) => (a.rank || 0) - (b.rank || 0)
      );

      setAllProperties(sortedProperties);
      setDataLoaded(true);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [getCategoryById]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

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
      const properties = selectedProperties.map((item) => item._id);
      const payload = { userId: user?._id, properties };

      if (properties.length > 0) {
        const response = await API.post(`/compare`, payload);
        getSuccessResponse(response, true);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [selectedProperties]);

  const hasSavedCompare = useRef(false);

  useEffect(() => {
    if (!hasSavedCompare.current && selectedProperties.length > 0) {
      SaveCompare();
      hasSavedCompare.current = true;
    }
  }, [SaveCompare, selectedProperties]);

  const gridCols =
    selectedProperties.length === 1
      ? "grid-cols-1"
      : selectedProperties.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  if (loading) return <ComparisonPageSkeleton />;
  return (
    <div className="bg-(--secondary-bg) text-(--text-color)  mx-auto  sm:px-8 sm:py-10 space-y-6">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedProperties.length === 0 &&
            Array.from({ length: 3 }).map((_, index) => (
              <MainGridCard
                key={`empty-${index}`}
                title="Add College"
                onClick={() => setModalOpen(true)}
                index={index}
              />
            ))}
        </div>
        {modalOpen && (
          <CompareModal
            allProperties={allProperties}
            selectedProperties={selectedProperties}
            onClose={handleModalClose}
            setSelectedProperties={handleSetSelectedProperties}
          />
        )}

        {selectedProperties.length > 0 && (
          <div>
            <BasicDetailTable
              selectedProperties={selectedProperties}
              removeProperty={removeProperty}
            />
          </div>
        )}

        {selectedProperties.length >= 2 && (
          <div>
            <ComparisonTable selectedProperties={selectedProperties} />
            <div
              className={`transition-all duration-500 ease-in-out opacity-100`}
            >
              <div className="p-0">
                <div className="hidden sm:block w-full overflow-x-auto">
                  <table className="w-full border-collapse table-fixed">
                    <tbody>
                      <tr className="bg-(--primary-bg) text-(--text-color) border-b border-(--border)">
                        <td className="p-4 font-semibold border-r border-(--border) w-52 sub-heading">
                          Visit College
                        </td>
                        {selectedProperties.map((prop, idx) => (
                          <td
                            key={idx}
                            className="text-center p-4 font-semibold text-(--text-color) border-r border-(--border) last:border-r-0 w-80"
                          >
                            <Link
                              href={`/${generateSlug(prop.category)}/${
                                prop.property_slug
                              }`}
                              className="inline-flex items-center gap-2 px-4 py-2 btn-shine rounded-custom font-medium"
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
                <div>
                  <div className="block sm:hidden">
                    <div className={`grid ${gridCols}`}>
                      {selectedProperties.map((prop, idx) => (
                        <div
                          key={idx}
                          className={`p-3 flex items-center justify-center border-(--border) ${
                            idx < selectedProperties.length - 1
                              ? "border-r"
                              : ""
                          }`}
                        >
                          <Link
                            href={`/${generateSlug(prop.category)}/${
                              prop.property_slug
                            }`}
                            className="inline-flex items-center gap-2 px-4 py-2 btn-shine rounded-custom font-medium"
                          >
                            Visit
                            <LuLink />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProperties;
