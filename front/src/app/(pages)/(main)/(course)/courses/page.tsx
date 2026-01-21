"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { FaGraduationCap } from "react-icons/fa";
import FiltersContent from "./_courses_components/FiltersContent";
import CourseCard from "./_courses_components/CourseCard";
import MobileFiltersCanvas from "./_courses_components/MobileFilters";
import ResultsHeader from "./_courses_components/ResultsHeader";
import { useSearchParams, useRouter } from "next/navigation";
import { CategoryProps, CourseProps } from "@/types/Types";
import {
  createDynamicFilterOptions,
  filterdCourses,
} from "./utils/filterUtils";
import API from "@/context/API";
// import ActiveFilterTags from "./_courses_components/ActiveFilters";
import {
  courseFilterProps,
  ExpandedCourseFiltersProps,
  FilterCourseSearchTermsProps,
} from "@/types/CourseFilterTypes";
import { generateSlug, getErrorResponse } from "@/context/Callbacks";
import Pagination from "@/ui/pagination/Pagination";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";

const ITEMS_PER_PAGE = 12;

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [allCourses, setAllCourses] = useState<CourseProps[]>([]);
  const [category, setCategory] = useState<CategoryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  const initializeFiltersFromURL = useCallback((): courseFilterProps => {
    const urlFilters: courseFilterProps = {
      certification_type: [],
      course_level: [],
      course_type: [],
      duration: [],
    };

    // Parse URL parameters
    Object.keys(urlFilters).forEach((key) => {
      const param = searchParams.get(key);
      if (param) {
        urlFilters[key as keyof courseFilterProps] = param
          .split(",")
          .filter(Boolean);
      }
    });

    return urlFilters;
  }, [searchParams]);

  const [expandedFilters, setExpandedFilters] =
    useState<ExpandedCourseFiltersProps>({
      course_level: true,
      course_type: true,
      certification_type: true,
      duration: true,
    });

  const [filters, setFilters] = useState<courseFilterProps>(
    initializeFiltersFromURL
  );

  const [filterSearchTerms, setFilterSearchTerms] =
    useState<FilterCourseSearchTermsProps>({
      course_level: "",
      course_type: "",
      certification_type: "",
      duration: "",
    });

  // Update URL when filters change - Fixed to prevent render cycle issues
  const updateURL = useCallback(
    (newFilters: courseFilterProps, page: number = 1) => {
      const params = new URLSearchParams();

      // Add search term if exists
      if (searchTerm) {
        params.set("search", searchTerm);
      }

      // Add page if not first page
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
        router.push(`/courses${newURL}`, { scroll: false });
      }, 0);
    },
    [router, searchTerm]
  );

  // Initialize from URL on mount
  useEffect(() => {
    const urlSearchTerm = searchParams.get("search") || "";
    const urlPage = parseInt(searchParams.get("page") || "1");

    setSearchTerm(urlSearchTerm);
    setCurrentPage(urlPage);
    setFilters(initializeFiltersFromURL());
  }, [searchParams, initializeFiltersFromURL]);

  const getCategories = useCallback(async () => {
    try {
      const response = await API.get(`/category`);
      setCategory(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const getCategoryById = useCallback(
    (id: string) => {
      const cat = category?.find((item) => item._id === id);
      return cat?.category_name;
    },
    [category]
  );
  const getAllCourseDetails = useCallback(async () => {
    setLoading(true);

    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    try {
      const [allCourseRes, allCourseSeoRes] = await Promise.allSettled([
        API.get(`/course`),
        API.get("/all/seo?type=course"),
      ]);

      if (
        allCourseRes.status === "fulfilled" &&
        allCourseSeoRes.status === "fulfilled"
      ) {
        const allCoursesData = allCourseRes?.value?.data || [];
        const seoData = allCourseSeoRes.value.data || [];

        const mergedCourses = allCoursesData.map((course: CourseProps) => {
          const seoMatch = seoData.find(
            (seo: any) => seo.course_id === course._id
          );

          return {
            ...course,
            course_level: getCategoryById(course.course_level),
            course_type: getCategoryById(course.course_type),
            certification_type: getCategoryById(course.certification_type),
            course_slug: seoMatch
              ? seoMatch.slug
              : generateSlug(course.course_name),
          };
        });

        // 🔀 Shuffle before setting state
        setAllCourses(shuffleArray(mergedCourses));
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [getCategoryById]);

  useEffect(() => {
    getAllCourseDetails();
  }, [getAllCourseDetails]);

  // Dynamic filter options
  const dynamicFilterOptions = useMemo(
    () => createDynamicFilterOptions(allCourses),
    [allCourses]
  );

  const filteredCoursesFound = useMemo(() => {
    let list = filterdCourses(allCourses, searchTerm, filters);

    if (sortBy === "A-Z") {
      list = [...list].sort((a, b) =>
        (a?.course_name || a?.course_name || "")
          .toLowerCase()
          .localeCompare((b?.course_name || b?.course_name || "").toLowerCase())
      );
    }

    if (sortBy === "Z-A") {
      list = [...list].sort((a, b) =>
        (b?.course_name || b?.course_name || "")
          .toLowerCase()
          .localeCompare((a?.course_name || a?.course_name || "").toLowerCase())
      );
    }

    return list;
  }, [searchTerm, filters, allCourses, sortBy]);

  const totalPages = Math.ceil(filteredCoursesFound.length / ITEMS_PER_PAGE);
  const displayedCourses: CourseProps[] = filteredCoursesFound.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    const emptyFilters: courseFilterProps = {
      course_level: [],
      course_type: [],
      certification_type: [],
      duration: [],
    };

    setFilters(emptyFilters);
    setFilterSearchTerms({
      course_level: "",
      course_type: "",
      certification_type: "",
      duration: "",
    });
    setCurrentPage(1);
    updateURL(emptyFilters, 1);
  };

  const toggleFilter = (filterType: keyof ExpandedCourseFiltersProps) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterType]: !prev[filterType],
    }));
  };

  const handleCheckboxFilter = (
    filterType: keyof courseFilterProps,
    value: string
  ) => {
    setFilters((prev) => {
      const currentValues = prev[filterType] as string[];

      const newFilters = {
        ...prev,
        [filterType]: currentValues.includes(value)
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };

      setCurrentPage(1);
      updateURL(newFilters, 1);
      return newFilters;
    });
  };

  // const removeFilterTag = (
  //   filterType: keyof courseFilterProps,
  //   value: string
  // ) => {
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
    filterType: keyof FilterCourseSearchTermsProps,
    value: string
  ) => {
    setFilterSearchTerms((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
  };

  if (loading) return <InsitutesLoader />;

  return (
    <>
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

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* <ActiveFilterTags
                filters={filters}
                onRemoveFilter={removeFilterTag}
                onClearAll={clearFilters}
              /> */}
              <ResultsHeader
                totalResults={filteredCoursesFound.length}
                currentPage={currentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                onShowMobileFilters={() => setShowMobileFilters(true)}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
              <div className="flex-1 overflow-y-auto pr-1 pb-10">
                {displayedCourses.length > 0 ? (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        : "space-y-6"
                    }
                  >
                    {displayedCourses.map((item, i) => (
                      <CourseCard
                        key={i}
                        course={item}
                        isListView={viewMode === "list"}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-(--primary-bg) shadow-custom rounded-custom">
                    <FaGraduationCap className="w-16 h-16 text-(--text-color) mx-auto mb-4" />
                    <h3 className="heading font-bold mb-2">No Course found</h3>
                    <p>Try adjusting your filters</p>
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
