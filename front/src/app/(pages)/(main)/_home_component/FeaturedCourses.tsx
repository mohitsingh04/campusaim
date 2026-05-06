"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { HeadingProps } from "@/ui/headings/MainHeading";
import React from "react";
import { generateSlug } from "@/context/Callbacks";
import { CourseProps } from "@/types/Types";
import API from "@/context/API";
import Image from "next/image";
import Link from "next/link";
import FeaturedCoursesSkeleton from "@/ui/loader/page/landing/_components/FeaturedCoursesSkeleton";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from "lucide-react";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import { useQuery } from "@tanstack/react-query";

const CourseCard = React.memo(({ course }: { course: CourseProps }) => {
  const courseImage = course.image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course.image?.[0]}`
    : "/img/default-images/campusaim-courses-featured.png";
  return (
    <div className="group bg-(--secondary-bg) text-(--text-color-emphasis) rounded-custom overflow-hidden shadow-custom transition-all duration-300 flex flex-col h-full transform-gpu">
      <div className="relative w-full overflow-hidden">
        <Link href={`/course/${course?.course_slug}`}>
          <div className="relative w-full aspect-2/1 bg-(--secondary-bg)">
            <Image
              src={courseImage}
              alt={course.course_name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          </div>
        </Link>

        <div className="absolute bottom-3 left-3 bg-(--main-emphasis) backdrop-blur-sm px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-(--main-subtle)! z-10">
          {course.course_type}
        </div>
      </div>

      <div className="p-5 flex flex-col grow">
        <Link
          href={`/course/${course?.course_slug}`}
          className="text-sm md:text-base font-semibold line-clamp-2 leading-tight group-hover:text-(--main) transition-colors min-h-10"
        >
          {course.course_name}
        </Link>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-(--border)">
          <div className="flex items-center gap-1.5">
            <ClockIcon size={12} className="text-(--main)" />
            <p className="text-xs">{course.duration}</p>
          </div>
          <Link
            href={`/course/${course?.course_slug}`}
            className="flex items-center gap-1 hover:text-(--main) text-xs font-bold transition-colors group/btn"
          >
            Details
            <ArrowRightIcon
              size={14}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
});

CourseCard.displayName = "CourseCard";

export default function PopularCourses() {
  const { getCategoryById, allCategories } = useGetAssets();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["popular-courses", allCategories?.length],
    queryFn: async () => {
      const [allCourseRes, allCourseSeoRes] = await Promise.allSettled([
        API.get(`/course?limit=6`),
        API.get("/all/seo?type=course"),
      ]);

      if (
        allCourseRes.status === "fulfilled" &&
        allCourseSeoRes.status === "fulfilled"
      ) {
        const allCoursesData = allCourseRes.value.data || [];
        const seoData = allCourseSeoRes.value.data || [];

        return allCoursesData
          .map((course: CourseProps) => {
            const seoMatch = seoData.find(
              (seo: any) => seo.course_id === course._id,
            );

            return {
              ...course,
              course_type: getCategoryById(course?.course_type),
              course_slug: seoMatch
                ? seoMatch.slug
                : generateSlug(course.course_name),
            };
          })
          .slice(0, 6);
      }
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <FeaturedCoursesSkeleton />;
  if (courses?.length <= 0) return;
  return (
    <section className="py-10 px-4 sm:px-8 w-full bg-(--primary-bg) overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between sm:items-end items-start mb-8 gap-6">
        <div className="w-full md:w-2/3">
          <HeadingProps
            tag="Explore Career-Focused Programs"
            title="Featured "
            activetitle="Courses"
            subtitle="Explore top courses for skills and career growth.s"
          />
        </div>
        <Link
          href={`/courses`}
          className="md:flex hidden items-center gap-2 text-(--main-emphasis) hover:text-(--main) font-bold transition-all duration-300 text-sm"
        >
          View All Courses
          <ArrowRightIcon size={18} />
        </Link>
      </div>

      <div className="relative group/slider">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1.2}
          loop={true}
          observer={true}
          observeParents={true}
          navigation={{
            nextEl: ".custom-next-button",
            prevEl: ".custom-prev-button",
          }}
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="pb-4!"
        >
          {courses.map((course: CourseProps, index: number) => (
            <SwiperSlide key={index} className="h-auto">
              <CourseCard course={course} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="custom-prev-button absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-(--primary-bg) p-2 rounded-full shadow-custom hover:bg-(--main) hover:text-( --main-extra) transition-all hidden xl:flex items-center justify-center cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-7 h-7" />
        </button>

        <button
          className="custom-next-button absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-(--primary-bg) p-2 rounded-full shadow-custom hover:bg-(--main) hover:text-( --main-extra) transition-all hidden xl:flex items-center justify-center cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-7 h-7" />
        </button>
      </div>

      <div className="md:hidden flex pt-6 justify-center">
        <Link
          href={`/courses`}
          className="flex items-center gap-2 text-(--main-emphasis) hover:text-(--main) font-bold text-sm"
        >
          View All Courses
          <ArrowRightIcon size={18} />
        </Link>
      </div>
    </section>
  );
}
