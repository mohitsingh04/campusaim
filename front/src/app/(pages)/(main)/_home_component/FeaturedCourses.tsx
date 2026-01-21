"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { BsArrowRight, BsClock } from "react-icons/bs";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { HeadingProps } from "@/ui/headings/MainHeading";
import { useCallback, useEffect, useState } from "react";
import { generateSlug, getErrorResponse } from "@/context/Callbacks";
import { CategoryProps, CourseProps } from "@/types/Types";
import API from "@/context/API";
import Image from "next/image";
import Link from "next/link";
import FeaturedCoursesSkeleton from "@/ui/loader/page/landing/_components/FeaturedCoursesSkeleton";

const CourseCard = ({ course }: { course: CourseProps }) => {
  return (
    <div className="group bg-(--secondary-bg) text-(--text-color-emphasis) rounded-custom overflow-hidden shadow-custom transition-all duration-300  flex flex-col relative top-0 hover:-top-1">
      <div className="relative w-full overflow-hidden ">
        <div className="relative w-full aspect-2/1">
          <Image
            src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course.image?.[0]}`}
            alt={course.course_name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        </div>

        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-(--main) ">
          {course.certification_type}
        </div>
      </div>

      <div className="p-5 flex flex-col grow">
        <h3 className="heading font-semibold line-clamp-2 leading-tight group-hover:text-(--main) transition-colors truncate">
          {course.course_name}
        </h3>

        <div className="mt-auto pt-2 flex items-center justify-between">
          {/* Duration */}
          <div className="flex items-center justify-end gap-2 py-1.5 rounded-md">
            <BsClock size={14} className="text-(--main)" />
            <p>{course.duration}</p>
          </div>
          <Link
            href={`/course/${course?.course_slug}`}
            className="flex items-center gap-1 hover:text-(--main) text-sm font-bold transition-colors group/btn"
          >
            View Details
            <BsArrowRight
              size={16}
              className="group-hover/btn:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function PopularCourses({
  categories,
}: {
  categories: CategoryProps[];
}) {
  const [courses, setCourses] = useState<CourseProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getCourse = useCallback(async () => {
    setLoading(true);
    try {
      const [allCourseRes, allCourseSeoRes] = await Promise.allSettled([
        API.get(`/course`),
        API.get("/all/seo?type=course"),
      ]);
      if (
        allCourseRes.status === "fulfilled" &&
        allCourseSeoRes.status === "fulfilled"
      ) {
        const allCoursesData = allCourseRes?.value?.data || [];
        const seoData = allCourseSeoRes.value.data || [];

        const mergedCourses = allCoursesData.map((course: CourseProps) => {
          const seoMatch = seoData.find(
            (seo: any) => seo.course_id === course._id
          );

          return {
            ...course,
            certification_type: categories?.find(
              (cat) => cat?._id === course?.certification_type
            )?.category_name,
            course_slug: seoMatch
              ? seoMatch.slug
              : generateSlug(course.course_name),
          };
        });

        const shuffled = mergedCourses.sort(() => 0.5 - Math.random());
        const randomSix = shuffled.slice(0, 6);
        setCourses(randomSix);
      }
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [categories]);

  useEffect(() => {
    getCourse();
  }, [getCourse]);

  if (loading) return <FeaturedCoursesSkeleton />;
  if (courses?.length <= 0) return;
  return (
    <div className="py-10 px-4 sm:px-8 w-full bg-(--primary-bg)">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between sm:items-end items-start mb-10 gap-6">
        <div className="w-full md:w-2/3">
          <HeadingProps
            tag="Next Level Yoga"
            title="Featured "
            activetitle="Courses"
            subtitle=" Discover sought-after, accredited programs. Train, master, and certify your practice with us"
          />
        </div>
        <Link
          href={`/courses`}
          className="md:flex hidden items-center gap-2 text-(--main) hover:text-(--main-subtle)  font-bold transition-all duration-300 "
        >
          View All Courses
          <BsArrowRight size={18} />
        </Link>
      </div>

      {/* Slider Section */}
      <div className="relative group/slider">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            el: ".custom-pagination",
            dynamicBullets: true,
          }}
          navigation={{
            nextEl: ".custom-next-button",
            prevEl: ".custom-prev-button",
          }}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
        >
          {courses.map((course, index) => (
            <SwiperSlide key={index}>
              <CourseCard course={course} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="custom-prev-button absolute left-3 sm:left-0 top-[40%] -translate-y-1/2 -translate-x-5 z-20 bg-white p-2 rounded-full shadow-custom  hover:bg-(--main) hover:text-white transition-all  xl:flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Previous slide"
        >
          <BiChevronLeft className="w-7 h-7" />
        </button>

        <button
          className="custom-next-button absolute right-3 sm:right-0 top-[40%] -translate-y-1/2 translate-x-5 z-20 bg-white p-2 rounded-full shadow-custom hover:bg-(--main) hover:text-white transition-all xl:flex items-center justify-center cursor-pointer active:scale-95"
          aria-label="Next slide"
        >
          <BiChevronRight className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile View All Button */}
      <div className="md:hidden flex pt-4 justify-start">
        <Link
          href={`/courses`}
          className="flex items-center gap-2 text-(--main) hover:text-(--main-subtle) font-bold transition-all duration-300 "
        >
          View All Courses
          <BsArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
