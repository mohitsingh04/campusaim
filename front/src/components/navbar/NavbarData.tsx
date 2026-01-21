import { useCallback, useEffect, useState } from "react";
import API from "@/context/API";
import { CategoryProps, CourseProps } from "@/types/Types";
import {
  generateSlug,
  getErrorResponse,
  shuffleArray,
} from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";

interface SeoProps {
  _id: string;
  course_id: string;
  slug: string;
}

export function useCoursesMenuData() {
  const [courseMenuData, setCourseMenuData] = useState<any>(null);
  const [courseLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);

        // 1. Fetch all courses
        const courseRes = await API.get("/course");
        const courses: CourseProps[] = courseRes.data;

        // 2. Fetch SEO slugs for courses
        const seoRes = await API.get("/all/seo?type=course");
        const seoList: SeoProps[] = seoRes.data;

        // 3. Build menu links (ONLY if SEO slug exists)
        const links = courses
          .map((course) => {
            // Match SEO entry
            const matchedSeo = seoList.find(
              (seo) => seo.course_id === course._id
            );

            // Skip if SEO slug not found
            if (!matchedSeo?.slug) return null;

            return {
              name: course.course_name, // name visible
              href: `/course/${matchedSeo.slug}`, // ONLY SEO SLUG
            };
          })
          .filter(Boolean) // remove nulls
          .slice(0, 30); // limit to top 30

        // 4. Build final menu structure
        const formattedMenu = {
          "Popular Courses": {
            main: {
              title: "Popular Courses",
              links,
              viewAll: "/courses",
            },
          },
        };

        setCourseMenuData(formattedMenu);
      } catch (err) {
        getErrorResponse(err, true);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courseMenuData, courseLoading };
}

export function usePropertyMenuData({
  category,
}: {
  category: CategoryProps[] | undefined;
}) {
  const [propertyMenuData, setPropertyMenuData] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);

  const getCategoryById = useCallback(
    (id: number | string) => {
      if (!category || category.length === 0) return null;

      const found = category.find(
        (item) => Number(item.uniqueId) === Number(id)
      );

      return found?.category_name || null;
    },
    [category]
  );

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setPropertyLoading(true);

        const res = await API.get("/property");
        const properties: PropertyProps[] = shuffleArray(res.data)
          ?.map((item: any) => {
            const catName = getCategoryById(item.category);
            const typeName = getCategoryById(item.property_type);

            if (!catName || !typeName) return null;

            return {
              ...item,
              category: catName,
              property_type: typeName,
            };
          })
          .filter(Boolean);

        const menuData: any = {};

        properties.forEach((p) => {
          if (!menuData[p.category]) {
            menuData[p.category] = {};
          }

          if (!menuData[p.category][p.property_type]) {
            menuData[p.category][p.property_type] = {
              title: p.property_type,
              links: [],
              viewAll: `/yoga-institutes?category=${generateSlug(
                p.category
              )}&property_type=${generateSlug(p.property_type)}`,
            };
          }

          // push property inside property_type
          menuData[p.category][p.property_type].links.push({
            name: p.property_name,
            href: `/${generateSlug(p.category)}/${p.property_slug}/overview`,
          });

          // ⭐ LIMIT TO MAX 15 PROPERTIES
          menuData[p.category][p.property_type].links = menuData[p.category][
            p.property_type
          ].links.slice(0, 10);
        });

        setPropertyMenuData(menuData);
      } catch (err) {
        getErrorResponse(err, true);
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchProperties();
  }, [getCategoryById]);

  return { propertyMenuData, propertyLoading };
}
