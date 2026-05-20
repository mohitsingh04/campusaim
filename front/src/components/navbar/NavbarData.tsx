import { useEffect, useState } from "react";
import API from "@/context/API";
import { ExamProps } from "@/types/Types";
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

export function useExamMenuData({ enabled = false }: { enabled?: boolean }) {
  const [examMenuData, setExamMenuData] = useState<any>(null);
  const [examLoading, setExamLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      if (!enabled || examMenuData) return;
      try {
        setExamLoading(true);

        const examRes = await API.get("/menu/exam");
        const allExams: ExamProps[] = examRes.data;

        setExamMenuData(allExams);
      } catch (err) {
        getErrorResponse(err, true);
      } finally {
        setExamLoading(false);
      }
    };

    fetchExams();
  }, [enabled, examMenuData]);

  return { examMenuData, examLoading };
}
