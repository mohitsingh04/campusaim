"use client";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import { CourseProps } from "@/types/Types";
import InfoCard from "@/ui/cards/InfoCard";
import HeadingLine from "@/ui/headings/HeadingLine";
import ListItem from "@/ui/list/ListItem";
import { InfoGridSkeleton } from "@/ui/loader/page/courses/_components/InfoGridSkeleton";
import { AwardIcon, BarChartIcon, ClockIcon, ZapIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

export default function CourseInfoGrid({
  course,
}: {
  course: CourseProps | null;
}) {
  const { getCategoryById } = useGetAssets();
  const [bestFor, setBestFor] = useState<{ _id: string; best_for: string }[]>(
    [],
  );
  const [courseEligibilities, setCourseCourseEligibilites] =
    useState<{ _id: string; course_eligibility: string }[]>();
  const [loading, setLoading] = useState(true);

  const getCourseAssests = useCallback(async () => {
    setLoading(true);
    try {
      const [bestForRes, courseEligibilityRes] = await Promise.allSettled([
        API.get<{ _id: string; best_for: string }[]>(`/best-for/all`),
        API.get<{ _id: string; course_eligibility: string }[]>(
          `/course-eligibility/all`,
        ),
      ]);
      const bestForData =
        bestForRes.status === "fulfilled" ? bestForRes.value.data : [];
      setBestFor(bestForData);

      const courseEligibilityData =
        courseEligibilityRes.status === "fulfilled"
          ? courseEligibilityRes.value.data
          : [];
      setCourseCourseEligibilites(courseEligibilityData);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCourseAssests();
  }, [getCourseAssests]);

  const getBestForById = (id: string) => {
    const found = bestFor?.find((item) => item?._id === id);
    return found?.best_for || id;
  };
  const getCourseEligibityById = (id: string) => {
    const found = courseEligibilities?.find(
      (item) => String(item?._id) === String(id),
    );
    return found?.course_eligibility || id;
  };
  const gridCount = [
    course?.specialization?.length,
    course?.course_eligibility?.length,
    course?.best_for?.length,
  ]?.filter(Boolean)?.length;

  if (loading) return <InfoGridSkeleton />;
  return (
    <>
      <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
        <HeadingLine title="Course Information" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            Icon={ZapIcon}
            title="Course Type"
            value={getCategoryById(course?.course_type || "") || ""}
          />
          <InfoCard
            Icon={AwardIcon}
            title="Program Type"
            value={getCategoryById(course?.program_type || "") || ""}
          />
          <InfoCard
            Icon={BarChartIcon}
            title="Degree Type"
            value={getCategoryById(course?.degree_type || "") || ""}
          />
          <InfoCard
            Icon={ClockIcon}
            title="Duration"
            value={course?.duration || ""}
          />
        </div>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-${gridCount || 1} gap-6`}>
        {(course?.specialization?.length || 0) > 0 && (
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Coure Specialization" />
            <ul className="space-y-3">
              {course?.specialization?.map((item: any, index: any) => (
                <ListItem
                  key={index}
                  text={getCategoryById(item || "") || ""}
                  type="include"
                />
              ))}
            </ul>
          </div>
        )}

        {(course?.best_for?.length || 0) > 0 && (
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Best For" />
            <ul className="space-y-3">
              {course?.best_for.map((item, index) => (
                <ListItem
                  key={index}
                  text={getBestForById(item)}
                  type="include"
                />
              ))}
            </ul>
          </div>
        )}
        {(course?.course_eligibility?.length || 0) > 0 && (
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Coure Eligibility" />
            <ul className="space-y-3">
              {course?.course_eligibility.map((item: any, index: any) => (
                <ListItem
                  key={index}
                  text={getCourseEligibityById(item)}
                  type="include"
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
