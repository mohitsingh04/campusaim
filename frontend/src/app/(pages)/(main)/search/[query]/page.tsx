"use client";
import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import {
  BlogCategoryProps,
  BlogsProps,
  BlogTagProps,
  CategoryProps,
  CourseProps,
  LocationProps,
  PropertyProps,
} from "@/types/types";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useMemo } from "react";
import {
  LuBookOpen,
  LuBuilding,
  LuGraduationCap,
  LuSearch,
  LuX,
} from "react-icons/lu";
import BlogCard from "../search_components/BlogCard";
import CourseCard from "../search_components/CourseCard";
import PropertyCard from "../search_components/PropertyCard";
import Pagination from "../search_components/Pagination";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import dynamic from "next/dynamic";

const SearchLoader = dynamic(
  () => import("@/components/Loader/Search/SearchLoader"),
  {
    ssr: false,
  }
);

const ITEMS_PER_PAGE = 10;
type SearchResult =
  | (PropertyProps & { type: "property" })
  | (CourseProps & { type: "course" })
  | (BlogsProps & { type: "blog" });

const SearchResults = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { query } = useParams();
  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [courses, setCourses] = useState<CourseProps[]>([]);
  const [blogs, setBlogs] = useState<BlogsProps[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyProps[]>(
    []
  );
  const [filteredCourses, setFilteredCourses] = useState<CourseProps[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogsProps[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [finalFilteredProperties, setFinalFilteredProperties] = useState<
    PropertyProps[]
  >([]);
  const [finalFilteredCourses, setFinalFilteredCourses] = useState<
    CourseProps[]
  >([]);
  const [finalFilteredBlogs, setFinalFilteredBlogs] = useState<BlogsProps[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchInput, query]);

  useEffect(() => {
    if (query) {
      setIsLoading(true);
      const safeQuery = Array.isArray(query) ? query[0] : query || "";
      const lowerQuery = generateSlug(safeQuery);

      const filteredProps = properties
        ?.filter(
          (propertyItem: PropertyProps) => propertyItem.status === "Active"
        )
        ?.filter(
          (prop) =>
            generateSlug(prop.property_name || "").includes(lowerQuery) ||
            (typeof prop.category === "string" &&
              generateSlug(prop.category).includes(lowerQuery)) ||
            (typeof prop.property_type === "string" &&
              generateSlug(prop.property_type).includes(lowerQuery)) ||
            generateSlug(prop.property_city || "").includes(lowerQuery) ||
            generateSlug(prop.property_state || "").includes(lowerQuery) ||
            generateSlug(prop.property_country || "").includes(lowerQuery)
        );

      const filteredCrs = courses.filter(
        (course) =>
          generateSlug(course?.course_type ?? "").includes(lowerQuery) ||
          (typeof course?.course_level === "string" &&
            generateSlug(course?.course_level).includes(lowerQuery)) ||
          generateSlug(course?.course_name || "").includes(lowerQuery) ||
          generateSlug(course?.course_short_name || "").includes(lowerQuery) ||
          (typeof course?.certification_type === "string" &&
            generateSlug(course?.certification_type).includes(lowerQuery))
      );

      const filteredBlgs = blogs.filter(
        (blog) =>
          generateSlug(blog.title || "").includes(lowerQuery) ||
          blog.category.some((cat) =>
            generateSlug(cat || "").includes(lowerQuery)
          ) ||
          blog.tags.some((tag) => generateSlug(tag || "").includes(lowerQuery))
      );

      setFilteredProperties(filteredProps);
      setFilteredCourses(filteredCrs);
      setFilteredBlogs(filteredBlgs);
      setIsLoading(false);
    } else {
      setFilteredProperties([]);
      setFilteredCourses([]);
      setFilteredBlogs([]);
      setIsLoading(false);
    }
  }, [query, properties, courses, blogs]);

  useEffect(() => {
    if (!searchInput.trim()) {
      setFinalFilteredProperties(filteredProperties);
      setFinalFilteredCourses(filteredCourses);
      setFinalFilteredBlogs(filteredBlogs);
      return;
    }

    const searchQuery = generateSlug(searchInput);

    const searchFilteredProps = filteredProperties.filter(
      (prop) =>
        generateSlug(prop.property_name || "").includes(searchQuery) ||
        (typeof prop.category === "string" &&
          generateSlug(prop.category).includes(searchQuery)) ||
        (typeof prop.property_type === "string" &&
          generateSlug(prop.property_type).includes(searchQuery)) ||
        generateSlug(prop.property_city || "").includes(searchQuery) ||
        generateSlug(prop.property_state || "").includes(searchQuery) ||
        generateSlug(prop.property_country || "").includes(searchQuery) ||
        generateSlug(prop.property_description || "").includes(searchQuery)
    );

    const searchFilteredCourses = filteredCourses.filter(
      (course) =>
        generateSlug(course.course_type || "").includes(searchQuery) ||
        (typeof course.course_level === "string" &&
          generateSlug(course.course_level).includes(searchQuery)) ||
        generateSlug(course.course_name || "").includes(searchQuery) ||
        generateSlug(course.course_short_name || "").includes(searchQuery) ||
        (typeof course.certification_type === "string" &&
          generateSlug(course.certification_type).includes(searchQuery)) ||
        generateSlug(course.course_format || "").includes(searchQuery) ||
        generateSlug(course.duration || "").includes(searchQuery)
    );

    const searchFilteredBlogs = filteredBlogs.filter(
      (blog) =>
        generateSlug(blog.title || "").includes(searchQuery) ||
        generateSlug(blog.blog || "").includes(searchQuery) ||
        generateSlug(blog.author_name || "").includes(searchQuery) ||
        blog.category.some((cat) =>
          generateSlug(cat || "").includes(searchQuery)
        ) ||
        blog.tags.some((tag) => generateSlug(tag || "").includes(searchQuery))
    );

    setFinalFilteredProperties(searchFilteredProps);
    setFinalFilteredCourses(searchFilteredCourses);
    setFinalFilteredBlogs(searchFilteredBlogs);
  }, [searchInput, filteredProperties, filteredCourses, filteredBlogs]);

  const getTotalResults = useCallback(() => {
    return (
      (finalFilteredProperties?.length || 0) +
      (finalFilteredCourses?.length || 0) +
      (finalFilteredBlogs?.length || 0)
    );
  }, [finalFilteredBlogs, finalFilteredCourses, finalFilteredProperties]);

  // Get paginated results based on active tab
  const paginatedResults = useMemo(() => {
    let allResults: SearchResult[] = [];

    if (activeTab === "all") {
      allResults = [
        ...finalFilteredProperties.map((item) => ({
          ...item,
          type: "property" as const,
        })),
        ...finalFilteredCourses.map((item) => ({
          ...item,
          type: "course" as const,
        })),
        ...finalFilteredBlogs.map((item) => ({
          ...item,
          type: "blog" as const,
        })),
      ];
    } else if (activeTab === "institutes") {
      allResults = finalFilteredProperties.map((item) => ({
        ...item,
        type: "property" as const,
      }));
    } else if (activeTab === "courses") {
      allResults = finalFilteredCourses.map((item) => ({
        ...item,
        type: "course" as const,
      }));
    } else if (activeTab === "blogs") {
      allResults = finalFilteredBlogs.map((item) => ({
        ...item,
        type: "blog" as const,
      }));
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    return {
      items: allResults.slice(startIndex, endIndex),
      totalItems: allResults.length,
      totalPages: Math.ceil(allResults.length / ITEMS_PER_PAGE),
    };
  }, [
    activeTab,
    finalFilteredProperties,
    finalFilteredCourses,
    finalFilteredBlogs,
    currentPage,
  ]);

  const getPropertiesAndCourseWithCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const [propertyRes, locationRes, catRes, courseRes] = await Promise.all([
        API.get("/property"),
        API.get("/locations"),
        API.get("/category"),
        API.get("/course"),
      ]);

      const processedCourses = courseRes.data.map((courseItem: CourseProps) => {
        const findCategoryNameById = (id: string | number) => {
          const found = catRes.data.find(
            (cat: CategoryProps) =>
              String(cat.uniqueId) === String(id) ||
              String(cat._id) === String(id)
          );
          return found?.category_name || null;
        };

        return {
          ...courseItem,
          course_type:
            findCategoryNameById(courseItem?.course_type) ||
            courseItem?.course_type,
          course_level:
            findCategoryNameById(courseItem.course_level) ||
            courseItem.course_level,
          certification_type:
            findCategoryNameById(courseItem.certification_type) ||
            courseItem.certification_type,
        };
      });
      setCourses(processedCourses);

      const processedProperties = propertyRes.data.map(
        (propertyItem: PropertyProps) => {
          const matchingLocation = locationRes.data.find(
            (locationItem: LocationProps) =>
              Number(locationItem.property_id) === propertyItem.uniqueId
          );

          const findCategoryNameById = (id: string | number) => {
            const found = catRes.data.find(
              (cat: CategoryProps) =>
                String(cat.uniqueId) === String(id) ||
                String(cat._id) === String(id)
            );
            return found?.category_name || null;
          };

          return {
            ...propertyItem,
            ...matchingLocation,
            category:
              findCategoryNameById(propertyItem.category) ||
              propertyItem.category,
            property_type:
              findCategoryNameById(propertyItem.property_type) ||
              propertyItem.property_type,
          };
        }
      );
      setProperties(processedProperties);

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, []);

  const getBlogsWithCategoryAndTags = useCallback(async () => {
    try {
      setIsLoading(true);
      const [blogRes, blogCategoryRes, blogTagRes] = await Promise.all([
        API.get<BlogsProps[]>("/blog"),
        API.get<BlogCategoryProps[]>("/blog/category/all"),
        API.get<BlogTagProps[]>("/blog/tag/all"),
      ]);

      const categoryMap: Record<number, string> = {};
      blogCategoryRes.data.forEach((cat) => {
        categoryMap[cat.uniqueId] = cat.blog_category;
      });

      const tagMap: Record<number, string> = {};
      blogTagRes.data.forEach((tag) => {
        tagMap[tag.uniqueId] = tag.blog_tag;
      });

      const updatedBlogs: BlogsProps[] = blogRes.data.map((blog) => {
        return {
          ...blog,
          category: blog.category.map((catId) => {
            const id = typeof catId === "string" ? Number(catId) : catId;
            return categoryMap[id] || String(catId);
          }),
          tags: blog.tags.map((tagId) => {
            const id = typeof tagId === "string" ? Number(tagId) : tagId;
            return tagMap[id] || String(tagId);
          }),
        };
      });

      setBlogs(updatedBlogs);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPropertiesAndCourseWithCategories();
    getBlogsWithCategoryAndTags();
  }, [getPropertiesAndCourseWithCategories, getBlogsWithCategoryAndTags]);

  const clearSearch = () => {
    setSearchInput("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: "Search" }, { label: `${query}` }]} />
      </div>
      <div className="container mx-auto max-w-7xl px-4 pb-8">
        <div className="relative flex-1 max-w-2xl mb-2">
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search courses, properties, institutes, blogs..."
            className="w-full pl-10 pr-12 py-3 text-lg rounded-xl bg-white shadow-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 transition"
            >
              <LuX className="h-5 w-5" />
            </button>
          )}
        </div>

        {(finalFilteredBlogs.length > 0 ||
          finalFilteredCourses.length > 0 ||
          finalFilteredProperties.length > 0) && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-gray-700 text-lg">
                Found{" "}
                <span className="font-bold text-purple-700">
                  {getTotalResults()}
                </span>{" "}
                results
                {paginatedResults.totalPages > 1 && (
                  <span className="text-gray-500 text-sm ml-2">
                    (Page {currentPage} of {paginatedResults.totalPages})
                  </span>
                )}
              </p>
              {searchInput && (
                <p className="text-gray-600 text-sm">
                  Filtered by: &quot;
                  <span className="font-medium">{searchInput}</span>&quot;
                </p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                {
                  key: "all",
                  label: "All",
                  icon: LuSearch,
                  count: getTotalResults(),
                },
                {
                  key: "institutes",
                  label: "Institutes",
                  icon: LuBuilding,
                  count: finalFilteredProperties.length,
                },
                {
                  key: "courses",
                  label: "Courses",
                  icon: LuGraduationCap,
                  count: finalFilteredCourses.length,
                },
                {
                  key: "blogs",
                  label: "Blogs",
                  icon: LuBookOpen,
                  count: finalFilteredBlogs.length,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 transform px-4 py-2 cursor-pointer rounded-xl text-sm shadow-sm transition-all ${
                    activeTab === tab.key
                      ? "bg-purple-600 text-white scale-95"
                      : "bg-white text-purple-600 hover:scale-105"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full ml-1">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading && <SearchLoader />}

        <div className="space-y-4">
          {paginatedResults.items.map((item, index) => {
            if (item.type === "property") {
              return <PropertyCard key={index} property={item} />;
            } else if (item.type === "course") {
              return <CourseCard key={index} course={item} />;
            } else if (item.type === "blog") {
              return <BlogCard key={index} blog={item} />;
            }
            return null;
          })}

          {/* No results */}
          {getTotalResults() === 0 && !isLoading && (
            <div className="text-center py-20">
              <div className="mb-4">
                <LuSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </div>
              <p className="text-xl text-gray-600 font-medium">
                No results found
                {searchInput ? (
                  <>
                    {" "}
                    for &quot;<span className="font-bold">{query}</span>&quot;
                    with filter &quot;
                    <span className="font-bold">{searchInput}</span>&quot;
                  </>
                ) : (
                  <>
                    {" "}
                    for &quot;<span className="font-bold">{query}</span>&quot;
                  </>
                )}
              </p>
              <p className="text-gray-500 mt-2">
                Try searching with different keywords or clear the search
                filter.
              </p>
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {paginatedResults.totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedResults.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default SearchResults;
