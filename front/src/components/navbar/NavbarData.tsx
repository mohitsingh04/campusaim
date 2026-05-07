import { useEffect, useState } from "react";
import API from "@/context/API";
import { ExamProps, SeoProps } from "@/types/Types";
import { getErrorResponse } from "@/context/Callbacks";

export function useCoursesMenuData({ enabled = false }: { enabled?: boolean }) {
  const [courseMenuData, setCourseMenuData] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    if (!enabled || courseMenuData) return;

    const fetchProperties = async () => {
      try {
        setCourseLoading(true);
        const res = await API.get("/menu/courses");
        const courses = res?.data;
        setCourseMenuData(courses);
      } catch (err) {
        getErrorResponse(err, true);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchProperties();
  }, [enabled, courseMenuData]);

  return { courseMenuData, courseLoading };
}
export function usePropertyMenuData({
  enabled = false,
}: {
  enabled?: boolean;
}) {
  const [propertyMenuData, setPropertyMenuData] = useState<any>(null);
  const [propertyLoading, setPropertyLoading] = useState(false);

  useEffect(() => {
    if (!enabled || propertyMenuData) return;

    const fetchProperties = async () => {
      try {
        setPropertyLoading(true);
        const res = await API.get("/menu/property");
        const properties = res?.data;
        setPropertyMenuData(properties);
      } catch (err) {
        getErrorResponse(err, true);
      } finally {
        setPropertyLoading(false);
      }
    };

    fetchProperties();
  }, [enabled, propertyMenuData]);

  return { propertyMenuData, propertyLoading };
}

export function useExamMenuData() {
  const [examMenuData, setExamMenuData] = useState<any>(null);
  const [examLoading, setExamLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setExamLoading(true);

        const examRes = await API.get("/exam");
        const allExams: ExamProps[] = examRes.data;

        const seoRes = await API.get("/all/seo?type=exam");
        const seoList: SeoProps[] = seoRes.data;

        const links = allExams
          .map((exam) => {
            const matchedSeo = seoList.find((seo) => seo.exam_id === exam._id);

            if (!matchedSeo?.slug) return null;

            return {
              name: exam.exam_short_name,
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
