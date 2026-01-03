import { generateSlug } from "@/contexts/Callbacks";
import { CourseProps } from "@/types/types";
import Image from "next/image";

import Link from "next/link";
import { LuClock, LuGraduationCap, LuTrendingUp } from "react-icons/lu";

const CoursesTab = ({
  courses,
  getCategoryById,
}: {
  courses: CourseProps[];
  getCategoryById: (id: string) => string | undefined;
}) => {
  return (
    <div className="space-y-6 p-4">
      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {courses?.map((course, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-xs overflow-hidden hover:shadow-sm transition-shadow"
          >
            <Link
              href={`/course/${generateSlug(course?.course_name)}`}
              className="block"
            >
              <div className="relative w-full h-48">
                <Image
                  src={
                    course?.image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
                      : "/img/default-images/campusaim-courses-featured.png"
                  }
                  alt={course?.course_name}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <div className="p-6">
              <Link href={`/course/${generateSlug(course?.course_name)}`}>
                <h3
                  className={`text-xl font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-all duration-300`}
                >
                  {course?.course_name}
                </h3>
              </Link>

              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <LuGraduationCap className="w-4 h-4 text-purple-600" />
                <span className="text-sm">
                  {getCategoryById(course?.course_type)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <LuClock className="w-4 h-4 text-purple-600" />
                <span className="text-sm">{course?.duration}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <LuTrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm">
                  {getCategoryById(course?.specialization)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesTab;
