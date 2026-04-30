import { useCallback, useEffect, useState } from "react";
import API from "@/context/API";
import { CategoryProps, CourseProps, SeoProps } from "@/types/Types";
import {
  generateSlug,
  getErrorResponse,
  shuffleArray,
} from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";

interface UsePropertyMenuDataProps {
  categories: CategoryProps[] | undefined;
  academicType?: string;
}

export function useCoursesMenuData() {
  const [courseMenuData, setCourseMenuData] = useState<any>(null);
  const [courseLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);

        const courseRes = await API.get("/course");
        const courses: CourseProps[] = courseRes.data;

        const seoRes = await API.get("/all/seo?type=course");
        const seoList: SeoProps[] = seoRes.data;

        const links = courses
          .map((course) => {
            const matchedSeo = seoList.find(
              (seo) => seo.course_id === course._id,
            );

            if (!matchedSeo?.slug) return null;

            return {
              name: course.course_name,
              href: `/course/${matchedSeo.slug}`,
            };
          })
          .filter(Boolean)
          .slice(0, 30);

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
  categories,
  academicType,
}: UsePropertyMenuDataProps) {
  const [propertyMenuData, setPropertyMenuData] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(true);

  const getCategoryById = useCallback(
    (_id: number | string) => {
      if (!categories?.length) return null;
      return categories.find((item) => item._id === _id)?.category_name || null;
    },
    [categories],
  );

  useEffect(() => {
    if (!categories?.length) return;

    const fetchProperties = async () => {
      try {
        setPropertyLoading(true);

        const res = await API.get("/property");

        const properties: PropertyProps[] = shuffleArray(res.data)
          .filter((p: any) => {
            if (!academicType) return true;

            const academicCategory = getCategoryById(p?.academic_type);
            if (!academicCategory) return false;

            return generateSlug(academicCategory) === academicType;
          })
          .map((item: any) => {
            const categoryName = getCategoryById(item?.academic_type);
            const propertyTypeName = getCategoryById(item?.property_type);

            if (!categoryName || !propertyTypeName) return null;

            return {
              ...item,
              academic_type: categoryName,
              property_type: propertyTypeName,
            };
          })
          .filter(Boolean);

        const menuData: Record<string, any> = {};

        properties.forEach((p) => {
          if (!menuData[p?.academic_type]) {
            menuData[p?.academic_type] = {};
          }

          if (!menuData[p?.academic_type][p?.property_type]) {
            menuData[p?.academic_type][p?.property_type] = {
              title: p?.property_type,
              links: [],
              viewAll: `${p?.academic_type === "University" ? "universities" : `${generateSlug(p?.academic_type)}s`}?property_type=${generateSlug(p?.property_type)}`,
            };
          }

          menuData[p?.academic_type][p?.property_type].links.push({
            name: p?.property_name,
            href: `/${generateSlug(p?.academic_type)}/${p?.property_slug}/overview`,
          });

          menuData[p?.academic_type][p?.property_type].links = menuData[
            p?.academic_type
          ][p?.property_type].links.slice(0, 10);
        });

        setPropertyMenuData(menuData);
      } catch (error) {
        getErrorResponse(error, true);
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchProperties();
  }, [categories, academicType, getCategoryById]);

  return { propertyMenuData, propertyLoading };
}

export function useExamMenuData() {
  const [examMenuData, setExamMenuData] = useState<any>(null);
  const [examLoading, setExamLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setExamLoading(true);

        const courseRes = await API.get("/exam");
        const courses: CourseProps[] = courseRes.data;

        const seoRes = await API.get("/all/seo?type=exam");
        const seoList: SeoProps[] = seoRes.data;

        const links = courses
          .map((exam) => {
            const matchedSeo = seoList.find((seo) => seo.exam_id === exam._id);

            if (!matchedSeo?.slug) return null;

            return {
              name: exam.exam_name,
              href: `/exam/${matchedSeo.slug}`,
            };
          })
          .filter(Boolean)
          .slice(0, 30);

        const formattedMenu = {
          "Popular Exams": {
            main: {
              title: "Popular Exams",
              links,
              viewAll: "/exams",
            },
          },
        };

        setExamMenuData(formattedMenu);
      } catch (err) {
        getErrorResponse(err, true);
      } finally {
        setExamLoading(false);
      }
    };

    fetchExams();
  }, []);

  return { examMenuData, examLoading };
}
