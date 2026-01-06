import { generateSlug } from "@/contexts/Callbacks";
import { CourseProps } from "@/types/types";
import Link from "next/link";
import React from "react";
import { LuBookOpenText, LuGraduationCap } from "react-icons/lu";

export default function CourseCard({
  course,
  handleStoreSearch,
  onClose,
}: {
  course: CourseProps;
  onClose: () => void;
  handleStoreSearch: () => void;
}) {
  return (
    <section>
      <div className="bg-purple-100 p-6 rounded-2xl shadow-xs flex justify-between items-start mt-2">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
            <LuBookOpenText className="w-6 h-6 text-purple-700" />
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/course/${generateSlug(course?.course_name)}`}
              onClick={() => {
                handleStoreSearch();
                onClose();
              }}
              className="text-lg font-semibold text-purple-600 hover:text-purple-800"
            >
              {course?.course_name}{" "}
              {course?.course_short_name && <>- {course?.course_short_name}</>}
            </Link>

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
