"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CourseProps } from "@/types/Types";
import { generateSlug, getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import HeadingLine from "@/ui/headings/HeadingLine";

const BlogCourse = () => {
  const [courses, setCourses] = useState<CourseProps[]>([]);

  const getCourse = useCallback(async () => {
    try {
      const [allCourseRes, allCourseSeoRes] = await Promise.allSettled([
        API.get(`/course`),
        API.get("/all/seo?type=course"),
      ]);

      if (
        allCourseRes.status === "fulfilled" &&
        allCourseSeoRes.status === "fulfilled"
      ) {
        const allCoursesData = allCourseRes.value.data || [];
        const seoData = allCourseSeoRes.value.data || [];

        const mergedCourses = allCoursesData.map((course: CourseProps) => {
          const seoMatch = seoData.find(
            (seo: any) => seo.course_id === course._id
          );

          return {
            ...course,
            course_slug:
              seoMatch?.slug || generateSlug(course.course_name || ""),
          };
        });

        setCourses(mergedCourses?.slice(0, 5) || []);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getCourse();
  }, [getCourse]);

  return (
    <div className="space-y-4">
      <div className="bg-(--primary-bg) text-(--text-color) rounded-custom shadow-custom p-5">
        <HeadingLine title="Courses" />

        <div className="space-y-4">
          {courses.map((courseItem) => {
            return (
              <Link
                key={courseItem.uniqueId}
                href={`/course/${courseItem.course_slug}`}
                className="flex space-x-3 group bg-(--secondary-bg) shadow-custom p-2 rounded-custom transition-colors items-center"
              >
                {/* Image */}
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 relative">
                  <Image
                    src={
                      courseItem?.image?.[0]
                        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${courseItem.image[0]}`
                        : "/img/default-images/yp-yoga-courses.webp"
                    }
                    alt={courseItem.course_name}
                    fill
                    sizes="80px"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="paragraph font-medium text-(--text-color-emphasis) group-hover:text-(--main) truncate transition-colors">
                    {courseItem.course_name}
                  </h4>

                  <p className="text-sm text-(--main) font-medium pt-1">
                    {courseItem.duration || "Yoga Course"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogCourse;
