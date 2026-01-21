"use client";
import { generateSlug } from "@/context/Callbacks";
import { PropertyCourseProps } from "@/types/PropertyTypes";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FaGraduationCap, FaClock, FaChartLine } from "react-icons/fa";

export default function CoursesTab({
  courses,
  getCategoryById,
}: {
  courses: PropertyCourseProps[];
  getCategoryById: (id: string | number) => string | undefined;
}) {
  const { category, property_slug, property_tab } = useParams();
  return (
    <section className="p-5">
      {/* Course Grid */}
      <div className="max-w-6xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-2 ">
        {courses.map((course, index) => (
          <div
            key={index}
            className="group rounded-custom shadow-custom bg-(--secondary-bg) transition-all duration-500 overflow-hidden"
          >
            {/* Image */}
            <div className="relative w-full h-52 overflow-hidden">
              <div className="relative w-full aspect-2/1">
                <Image
                  src={
                    course?.image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
                      : "/img/default-images/yp-yoga-courses.webp"
                  }
                  alt={course.course_name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Category Badge */}
              <div className="absolute bottom-3 left-3 bg-(--main-light) text-(--main-emphasis) text-xs px-3 py-1 rounded-full shadow-custom">
                {getCategoryById(course.course_type)}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 md:pt-2">
              <h3 className="sub-heading font-semibold text-(--text-color-emphasis) group-hover:text-(--main) mb-1 transition-colors">
                {course.course_name}
              </h3>

              <div className="grid grid-cols-2 text-(--text-color) text-xs gap-2">
                <div className="flex items-center gap-3">
                  <FaGraduationCap className="text-(--main) w-3 h-3" />
                  <span>{getCategoryById(course.certification_type)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-(--main) w-3 h-3" />
                  <span>{course?.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaChartLine className="text-(--main) w-3 h-3" />
                  <span>{getCategoryById(course.course_level)}</span>
                </div>
              </div>

              {/* Button */}
              <ButtonGroup
                label="View Details"
                className="w-full mt-3"
                href={`/${category}/${property_slug}/${property_tab}/${generateSlug(
                  course?.course_name
                )}`}
                disable={false}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
