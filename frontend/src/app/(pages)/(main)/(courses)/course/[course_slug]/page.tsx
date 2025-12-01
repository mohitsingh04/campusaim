"use client";
import API from "@/contexts/API";
import { generateSlug } from "@/contexts/Callbacks";
import { CategoryProps, CourseProps } from "@/types/types";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { LuCircleCheck } from "react-icons/lu";
import RelatedCourses from "../_course_components/RelatedCourses";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import Loader from "@/components/Loader/Loader";
import CourseDetailCard from "../_course_components/CourseCard";
import CourseEnquiryForm from "../_course_components/CourseEnquiryForm";
import ReadMoreLess from "@/components/read-more/ReadMoreLess";
import RelatedInstitutes from "../_course_components/RelatedInstitutes";

export default function Course() {
  const { course_slug } = useParams();
  const [courses, setCourses] = useState<CourseProps[]>([]);
  const [mainCourse, setMainCourse] = useState<CourseProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryProps[]>([]);

  const getCourses = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        API.get<CourseProps[]>(`/course`),
        API.get<{ _id: string; requirment: string }[]>(`/requirment/all`),
        API.get<{ _id: string; key_outcome: string }[]>(`/key-outcome/all`),
        API.get<CategoryProps[]>(`/category`),
      ]);

      const [coursesRes, requirementsRes, keyOutcomesRes, categoryRes] =
        results;

      if (coursesRes.status !== "fulfilled") {
        console.error("Failed to fetch courses:", coursesRes.reason);
        return;
      }

      const coursesData = coursesRes.value.data;
      const requirementsData =
        requirementsRes.status === "fulfilled"
          ? requirementsRes.value.data
          : [];
      const keyOutcomesData =
        keyOutcomesRes.status === "fulfilled" ? keyOutcomesRes.value.data : [];
      const categoryData =
        categoryRes.status === "fulfilled" ? categoryRes.value.data : [];
      setCategory(categoryData);

      // Create lookup maps
      const requirementMap = new Map<string, string>();
      requirementsData.forEach((req) => {
        requirementMap.set(req._id, req.requirment);
      });

      const keyOutcomeMap = new Map<string, string>();
      keyOutcomesData.forEach((ko) => {
        keyOutcomeMap.set(ko._id, ko.key_outcome);
      });

      const categoryMap = new Map<string, string>();
      categoryData.forEach((cat) => {
        categoryMap.set(cat._id, cat.category_name);
      });

      const populatedCourses: CourseProps[] = coursesData.map((item) => {
        const populatedRequirements =
          (item.requirements
            ?.map((id) => requirementMap.get(id))
            .filter(Boolean) as string[]) ?? [];

        const populatedKeyOutcomes =
          (item.key_outcomes
            ?.map((id) => keyOutcomeMap.get(id))
            .filter(Boolean) as string[]) ?? [];

        return {
          ...item,
          requirements: populatedRequirements,
          key_outcomes: populatedKeyOutcomes,
          course_type: categoryMap.get(item.course_type) ?? item.course_type,
          course_level: categoryMap.get(item.course_level) ?? item.course_level,
          certification_type:
            categoryMap.get(item.certification_type) ?? item.certification_type,
        };
      });

      const filteredCourses = populatedCourses.filter(
        (item) => generateSlug(item.course_name) !== course_slug
      );

      const shuffledCourses = filteredCourses.sort(() => Math.random() - 0.5);

      const randomSixCourses = shuffledCourses.slice(0, 6);

      setCourses(randomSixCourses);

      setMainCourse(
        populatedCourses.find(
          (item) => generateSlug(item.course_name) === course_slug
        ) ?? null
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [course_slug]);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-purple-50 text-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Breadcrumb
          items={[
            { label: "Courses" },
            { label: mainCourse?.course_name || "Course Name" },
          ]}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 py-3">
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <CourseDetailCard course={mainCourse} />
              {(mainCourse?.best_for?.length || 0) > 0 && (
                <div className="bg-white shadow-sm rounded-2xl my-2">
                  <div className="p-6">
                    <h4 className="font-semibold mb-4 text-gray-800">
                      Perfect For
                    </h4>
                    <div className="space-y-3 text-sm">
                      {mainCourse?.best_for?.map((item, index) => (
                        <div
                          className="flex items-center space-x-3"
                          key={index}
                        >
                          <LuCircleCheck className="w-4 h-4 text-purple-500" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-0">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white sm:rounded-2xl sm:shadow-sm  overflow-hidden">
                <div className="space-y-6 p-6">
                  {mainCourse?.description && (
                    <div>
                      <h2 className="text-xl uppercase font-bold text-gray-600 mb-3">
                        About {mainCourse?.course_name || "Institute"}
                      </h2>
                      <ReadMoreLess htmlText={mainCourse?.description} />
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    {(mainCourse?.key_outcomes?.length || 0) > 0 && (
                      <div className="bg-purple-50 rounded-xl p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            What Will You Achieve
                          </h3>
                        </div>

                        {mainCourse?.key_outcomes?.map((item, index) => (
                          <div
                            className="flex items-center space-x-3 text-sm/8"
                            key={index}
                          >
                            <LuCircleCheck className="w-4 h-4 text-purple-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(mainCourse?.requirements?.length || 0) > 0 && (
                      <div className="bg-purple-50 rounded-xl p-5 shadow-xs">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Requirements
                          </h3>
                        </div>

                        {mainCourse?.requirements?.map((item, index) => (
                          <div
                            className="flex items-center space-x-3 text-sm/8"
                            key={index}
                          >
                            <LuCircleCheck className="w-4 h-4 text-purple-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Highlights Card */}

              <div className="bg-white shadow-sm rounded-2xl my-2 p-4">
                <RelatedCourses relatedCourses={courses} />
              </div>
            </div>
            <CourseEnquiryForm course={mainCourse} />
            <RelatedInstitutes course={mainCourse} category={category} />
          </div>
        </div>
      </div>
    </div>
  );
}
