"use client";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import { CourseProps } from "@/types/Types";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import Image from "next/image";
import React from "react";

export default function CourseCard({ course }: { course: CourseProps | null }) {
  const { getCategoryById } = useGetAssets();
  const imageSrc = course?.image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course.image[0]}`
    : "/img/default-images/campusaim-courses-featured.png";

  return (
    <div className=" bg-(--primary-bg) rounded-custom overflow-hidden shadow-custom sticky top-28">
      <div className="relative w-full aspect-2/1">
        <Image
          src={imageSrc}
          alt={course?.course_name || "Course Image"}
          fill
          className="w-full object-cover aspect-16/10"
        />
        <span className="absolute bottom-4 left-4 px-3 py-1 bg-(--main-subtle) text-(--main-emphasis) text-sm font-medium rounded-custom shadow-custom">
          {getCategoryById(course?.course_type || "")}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center mb-2">
          <div className="ml-3">
            <h1 className="heading font-semibold text-(--text-color-emphasis)">
              {course?.course_name}
              {course?.course_short_name && ` - (${course?.course_short_name})`}
            </h1>
          </div>
        </div>

        <div className="md:col-span-2 mt-4 gap-y-4">
          <ButtonGroup
            label="Send Enquiry"
            type="submit"
            className="w-full"
            disable={false}
            href="#enquiry"
          />
        </div>
      </div>
    </div>
  );
}
