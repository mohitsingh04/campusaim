import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { CourseProps } from "@/types/Types";
import Link from "next/link";
import Image from "next/image";
import { PiBookOpenTextLight, PiCertificateLight } from "react-icons/pi";
import { FiAward } from "react-icons/fi";

const CourseCard = ({
  course,
  isListView,
}: {
  course: CourseProps;
  isListView: boolean;
}) => {
  if (!course) {
    return null;
  }
  const slug = `/course/${course.course_slug}`;
  const imageSrc = course?.image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course.image[0]}`
    : "/img/default-images/yp-yoga-courses.webp";

  return (
    <div
      className={`bg-(--primary-bg) rounded-custom shadow-custom transition-all duration-300 overflow-hidden group cursor-pointer
      ${
        isListView ? "flex flex-col md:flex-row h-full" : "flex flex-col h-full"
      }`}
    >
      {/* IMAGE */}
      <div
        className={`overflow-hidden ${
          isListView ? "w-full md:w-80 lg:w-96 shrink-0" : "w-full"
        }`}
      >
        <Link href={slug}>
          <div
            className={`relative w-full ${
              isListView ? "h-56 md:h-full" : "aspect-2/1 min-h-48"
            }`}
          >
            <Image
              src={imageSrc}
              fill
              alt={course?.course_name || "Yoga course"}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </Link>
      </div>

      {/* CONTENT */}
      <div className="p-5 md:p-6 flex flex-col flex-1 gap-4 h-full">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <Link href={slug}>
              <h2 className="sub-heading font-semibold hover:text-(--main) line-clamp-2 mb-2">
                {course?.course_name || "Unnamed course"}
              </h2>
            </Link>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FiAward className="text-(--main) w-4 h-4" />
                <p>{course.course_level}</p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <PiCertificateLight className="text-(--main) w-4 h-4" />
                <p>{course.certification_type}</p>
              </div>
              <div className="flex items-center gap-2 col-span-2 text-sm">
                <PiBookOpenTextLight className="text-(--main) w-4 h-4" />
                <p>{course.course_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FIXED BOTTOM BUTTON */}
        <div className="mt-auto">
          <ButtonGroup
            label="View Details"
            href={slug}
            className="w-full"
            disable={false}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
