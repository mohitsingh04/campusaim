import { generateSlug } from "@/contexts/Callbacks";
import { CourseProps } from "@/types/types";
import Link from "next/link";
import React from "react";
import { LuBookOpenText, LuGraduationCap, LuTrendingUp } from "react-icons/lu";

export default function CourseCard({ course }: { course: CourseProps }) {
  return (
    <section>
      <div className="bg-white p-6 rounded-2xl shadow-xs flex justify-between items-start mt-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
            <LuBookOpenText className="w-6 h-6 text-purple-700" />
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/course/${generateSlug(course?.course_name)}`}
              className="text-lg font-semibold text-purple-600 hover:text-purple-800"
            >
              {course?.course_name}{" "}
              {course?.course_short_name && <>- {course?.course_short_name}</>}
            </Link>

            <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
              <LuTrendingUp className="w-4 h-4 text-purple-500" />
              <span>{course?.course_level}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LuGraduationCap className="w-5 h-5 text-purple-600" />
          <h3 className="text-xl font-bold text-purple-800">Course</h3>
        </div>
      </div>
    </section>
  );
}
