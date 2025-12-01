import { CourseProps } from "@/types/types";
import Image from "next/image";
import React from "react";
import {
  LuClock,
  LuFileBadge2,
  LuGraduationCap,
  LuLayers,
} from "react-icons/lu";

const CourseDetailCard = ({
  course,
}: {
  course: CourseProps | null | undefined;
}) => {
  return (
    <div className="bg-white overflow-hidden sm:rounded-2xl sm:shadow-sm">
      {/* Banner Image */}
      <div className="aspect-video bg-red-900 relative overflow-hidden">
        <Image
          src={
            course?.image?.[0]
              ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
              : "/img/default-images/yp-yoga-courses.webp"
          }
          alt="Course Featured Image"
          fill
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="p-4 md:p-6">
        <h1 className="text-lg md:text-2xl font-semibold text-gray-700 leading-tight mb-2">
          {course?.course_name}
        </h1>

        <p className="text-gray-600 text-sm md:text-base mb-4">
          {course?.course_short_name}
        </p>

        {/* Info Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-700 text-sm">
          {course?.duration && (
            <div className="flex items-center whitespace-nowrap">
              <LuClock className="w-4 h-4 mr-2 text-purple-500 shrink-0" />
              <span className="truncate" title={course?.duration}>
                {course.duration}
              </span>
            </div>
          )}

          {course?.certification_type && (
            <div className="flex items-center whitespace-nowrap">
              <LuFileBadge2 className="w-4 h-4 mr-2 text-purple-500 shrink-0" />
              <span className="truncate" title={course?.certification_type}>
                {course.certification_type}
              </span>
            </div>
          )}

          {course?.course_type && (
            <div className="flex items-center whitespace-nowrap">
              <LuGraduationCap className="w-4 h-4 mr-2 text-purple-500 shrink-0" />
              <span className="truncate" title={course?.course_type}>
                {course.course_type}
              </span>
            </div>
          )}

          {course?.course_level && (
            <div className="flex items-center whitespace-nowrap">
              <LuLayers className="w-4 h-4 mr-2 text-purple-500 shrink-0" />
              <span className="truncate" title={course?.course_level}>
                {course.course_level}
              </span>
            </div>
          )}
        </div>

        {/* Enquiry Button */}
        {/* <div className="mt-8">
          <a
            href="#enquiry"
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold hover:opacity-90 transition"
          >
            Enquiry
          </a>
        </div> */}
      </div>
    </div>
  );
};

export default CourseDetailCard;
