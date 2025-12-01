"use client";
import { useState, useEffect, useCallback } from "react";
import { LuSearch, LuX } from "react-icons/lu";
import PropertyCard from "./searchModalComponents/PropertyCard";
import CourseCard from "./searchModalComponents/CourseCard";
import BlogCard from "./searchModalComponents/BlogCard";
import {
  BlogCategoryProps,
  BlogsProps,
  BlogTagProps,
  CategoryProps,
  CourseProps,
  LocationProps,
  PropertyProps,
} from "@/types/types";
import API from "@/contexts/API";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/contexts/Callbacks";
import { createPortal } from "react-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// helper: safely check if string and includes
const safeIncludes = (value: unknown, query: string) =>
  typeof value === "string" && value.toLowerCase().includes(query);

const LIMIT_PER_CATEGORY = 5;
const TOTAL_VISIBLE_LIMIT = 15;

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyProps[]>([]);
  const [courses, setCourses] = useState<CourseProps[]>([]);
  const [blogs, setBlogs] = useState<BlogsProps[]>([]);

  const [filteredProperties, setFilteredProperties] = useState<PropertyProps[]>(
    []
  );
  const [filteredCourses, setFilteredCourses] = useState<CourseProps[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogsProps[]>([]);

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
          course_level:
            findCategoryNameById(courseItem.course_level) ||
            courseItem.course_level,
          certification_type:
            findCategoryNameById(courseItem.certification_type) ||
            courseItem.certification_type,
        };
      });

      setCourses(processedCourses);

      const processedProperties = propertyRes.data
        ?.filter(
          (propertyItem: PropertyProps) => propertyItem.status === "Active"
        )
        ?.map((propertyItem: PropertyProps) => {
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
        });

      setProperties(processedProperties);

      setIsLoading(false);
    } catch (error) {
      console.error(error);
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

      const updatedBlogs = blogRes.data.map((blog) => ({
        ...blog,
        category: blog.category.map((catId) => {
          const id = Number(catId);
          return categoryMap[id] || String(catId);
        }),
        tags: blog.tags.map((tagId) => {
          const id = Number(tagId);
          return tagMap[id] || String(tagId);
        }),
      }));

      setBlogs(updatedBlogs);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getPropertiesAndCourseWithCategories();
    getBlogsWithCategoryAndTags();
  }, [getPropertiesAndCourseWithCategories, getBlogsWithCategoryAndTags]);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/\s+/g, " ");
      if (val.startsWith(" ")) val = val.trim();
      setQuery(val);

      if (val.length >= 3) {
        setIsLoading(true);
        const lower = val.toLowerCase();

        const props = properties.filter(
          (p) =>
            safeIncludes(p.property_name, lower) ||
            safeIncludes(p.category, lower) ||
            safeIncludes(p.property_type, lower) ||
            safeIncludes(p.property_city, lower) ||
            safeIncludes(p.property_state, lower) ||
            safeIncludes(p.property_country, lower)
        );

        const crs = courses.filter(
          (c) =>
            safeIncludes(c.course_type, lower) ||
            safeIncludes(c.course_level, lower) ||
            safeIncludes(c.course_name, lower) ||
            safeIncludes(c.course_short_name, lower) ||
            safeIncludes(c.certification_type, lower)
        );

        const blgs = blogs.filter(
          (b) =>
            safeIncludes(b.title, lower) ||
            b.category.some((c) => safeIncludes(c, lower)) ||
            b.tags.some((t) => safeIncludes(t, lower))
        );

        setFilteredProperties(props);
        setFilteredCourses(crs);
        setFilteredBlogs(blgs);
        setIsLoading(false);
      } else {
        setFilteredProperties([]);
        setFilteredCourses([]);
        setFilteredBlogs([]);
      }
    },
    [properties, courses, blogs]
  );

  const handleStoreSearch = useCallback(async () => {
    try {
      await API.post("/search", { search: query });
    } catch (error) {
      console.error(error);
    }
  }, [query]);

  const redirectToFullPage = useCallback(() => {
    router.push(`/search/${generateSlug(query)}`);
    handleStoreSearch();
    setQuery("");
    onClose();
  }, [query, router, handleStoreSearch, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && query.length >= 3) redirectToFullPage();
    },
    [redirectToFullPage, query]
  );

  const handleSearchButton = useCallback(() => {
    if (query.length >= 3) redirectToFullPage();
  }, [redirectToFullPage, query]);

  if (!isOpen) return null;

  const totalResults =
    filteredProperties.length + filteredCourses.length + filteredBlogs.length;

  const shouldShowLoadMore = totalResults > TOTAL_VISIBLE_LIMIT;

  // trimming results (5 each)
  const slicedProps = filteredProperties.slice(0, LIMIT_PER_CATEGORY);
  const slicedCrs = filteredCourses.slice(0, LIMIT_PER_CATEGORY);
  const slicedBlgs = filteredBlogs.slice(0, LIMIT_PER_CATEGORY);

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-white text-purple-900 flex flex-col">
      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-8 py-4 bg-white shadow-xs sticky top-0 z-50">
        <div className="relative">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search properties, courses, blogs..."
            value={query}
            onKeyDown={handleKeyDown}
            onChange={handleSearch}
            className="w-full pl-12 pr-10 py-4 text-lg border-2 border-purple-300 rounded-xl shadow-xs focus:outline-none focus:border-purple-500"
            autoFocus
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            <button
              onClick={handleSearchButton}
              className="text-purple-600 hover:bg-purple-100 p-2 rounded-full"
            >
              <LuSearch className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="text-purple-600 hover:bg-purple-100 p-2 rounded-full"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {isLoading && (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-purple-500">Searching...</p>
          </div>
        )}

        {!isLoading && query.length >= 3 && (
          <>
            {totalResults === 0 ? (
              <p className="text-center text-purple-600 mt-10">
                No results found.
              </p>
            ) : (
              <div className="grid gap-6">
                {slicedProps.map((prop, index) => (
                  <PropertyCard
                    key={index}
                    property={prop}
                    handleStoreSearch={handleStoreSearch}
                    onClose={onClose}
                  />
                ))}

                {slicedCrs.map((course, index) => (
                  <CourseCard
                    key={index}
                    course={course}
                    handleStoreSearch={handleStoreSearch}
                    onClose={onClose}
                  />
                ))}

                {slicedBlgs.map((blog, index) => (
                  <BlogCard
                    key={index}
                    blog={blog}
                    handleStoreSearch={handleStoreSearch}
                    onClose={onClose}
                  />
                ))}
              </div>
            )}

            {shouldShowLoadMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={redirectToFullPage}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  Load More Results
                </button>
              </div>
            )}
          </>
        )}

        {query.length < 3 && (
          <p className="text-center text-purple-600 mt-10">
            Type at least 3 characters to search
          </p>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SearchModal;
