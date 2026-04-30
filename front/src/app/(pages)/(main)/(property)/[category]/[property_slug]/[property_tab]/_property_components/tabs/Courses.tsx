"use client";
import API from "@/context/API";
import {
  generateSlug,
  getErrorResponse,
  mergeCourseData,
} from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import { CourseProps } from "@/types/Types";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import TabLoading from "@/ui/loader/component/TabLoading";
import { useQuery } from "@tanstack/react-query";
import { ChartLineIcon, ClockIcon, GraduationCapIcon } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function CoursesTab({
  property,
  getCategoryById,
}: {
  property: PropertyProps | null;
  getCategoryById: (id: string | number) => string | undefined;
}) {
  const { category, property_slug, property_tab } = useParams();

  const { data: allCourses = [], isLoading } = useQuery<CourseProps[]>({
    queryKey: ["courses", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];

      try {
        const [propertyCourseRes, allCourseRes] = await Promise.allSettled([
          API.get(`/property/property-course/${property._id}`),
          API.get(`/course`),
        ]);

        let propertyCourseData: any[] = [];
        let allCourseData: any[] = [];

        if (propertyCourseRes.status === "fulfilled") {
          propertyCourseData = propertyCourseRes.value?.data || [];
        }

        if (allCourseRes.status === "fulfilled") {
          allCourseData = allCourseRes.value?.data || [];
        }

        const mergedCourses =
          propertyCourseData.length && allCourseData.length
            ? (mergeCourseData(
                propertyCourseData,
                allCourseData,
              ) as unknown as CourseProps[])
            : [];

        return mergedCourses;
      } catch (error) {
        getErrorResponse(error, true);
        throw error;
      }
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <TabLoading />;
  return (
    <section className="p-5">
      <div className="max-w-6xl mx-auto grid gap-5 sm:grid-cols-2 lg:grid-cols-2 ">
        {allCourses.map((course, index) => (
          <div
            key={index}
            className="group rounded-custom shadow-custom bg-(--secondary-bg) transition-all duration-500 overflow-hidden"
          >
            <div className="relative w-full h-52 overflow-hidden">
              <div className="relative w-full aspect-2/1">
                <Image
                  src={
                    course?.image?.[0]
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
                      : "/img/default-images/campusaim-courses-featured.png"
                  }
                  alt={course.course_name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div className="absolute bottom-3 left-3 bg-(--main-emphasis) text-(--main-subtle) text-xs px-3 py-1 rounded-full shadow-custom">
                {getCategoryById(course.course_type)}
              </div>
            </div>

            <div className="p-5 md:pt-2">
              <h3 className="sub-heading font-semibold text-(--text-color-emphasis) group-hover:text-(--main) mb-1 transition-colors">
                {course.course_name}
              </h3>

              <div className="grid grid-cols-2 text-(--text-color) text-xs gap-2">
                <div className="flex items-center gap-3">
                  <GraduationCapIcon className="text-(--main) w-3 h-3" />
                  <span>{getCategoryById(course.degree_type)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ClockIcon className="text-(--main) w-3 h-3" />
                  <span>{course?.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ChartLineIcon className="text-(--main) w-3 h-3" />
                  <span>{getCategoryById(course.program_type)}</span>
                </div>
              </div>

              {/* Button */}
              <ButtonGroup
                label="View Details"
                className="w-full mt-3"
                href={`/${category}/${property_slug}/${property_tab}/${generateSlug(
                  course?.course_name,
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
