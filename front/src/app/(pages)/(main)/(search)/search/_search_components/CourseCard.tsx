import { generateSlug } from "@/context/Callbacks";
import { CourseProps } from "@/types/Types";
import Link from "next/link";
import { LuBookOpenText, LuGraduationCap, LuTrendingUp } from "react-icons/lu";

export default function CourseCard({ course }: { course: CourseProps }) {
  return (
    <section className="w-full">
      <div className="bg-(--primary-bg) text-(--text-color) p-4 sm:p-6 rounded-custom shadow-custom flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-2">
        <div className="flex items-center sm:items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-(--main-light) text-(--main-emphasis) rounded-full flex items-center justify-center shrink-0">
            <LuBookOpenText className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <div className="flex flex-col">
            <Link
              href={`/course/${generateSlug(course?.course_slug || "")}`}
              className="sub-heading font-semibold text-(--text-color-emphasis) hover:text-(--main) line-clamp-1"
            >
              {course?.course_name}
              {course?.course_short_name && (
                <span className=""> - {course?.course_short_name}</span>
              )}
            </Link>

            <div className="flex items-center gap-2 text-xs sm:text-sm mt-1 flex-wrap">
              <LuTrendingUp className="w-4 h-4" />
              <span className="truncate max-w-[200px] sm:max-w-none">
                {course?.course_level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:self-end justify-end sm:justify-start">
          <LuGraduationCap className="w-3 h-3 sm:w-6 sm:h-6 " />
          <h3 className="text-xs sm:text-lg font-bold">Course</h3>
        </div>
      </div>
    </section>
  );
}
