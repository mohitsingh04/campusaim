"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { LuArrowRight, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { cardVariants } from "@/contexts/varients";
import API from "@/contexts/API";
import { CourseProps } from "@/types/types";
import Link from "next/link";
import { generateSlug } from "@/contexts/Callbacks";
import Image from "next/image";

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<CourseProps[]>([]);

  const getCourse = useCallback(async () => {
    try {
      const response = await API.get(`/course`);
      const allCourses = response.data;

      const shuffled = allCourses.sort(() => 0.5 - Math.random());
      const randomSix = shuffled.slice(0, 6);

      setCourses(randomSix);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getCourse();
  }, [getCourse]);

  if (courses?.length <= 0) {
    return;
  }
  return (
    <section className="py-16 px-4 sm:px-8 md:px-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto mb-10 text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">
          Featured <span className="text-purple-600">Courses</span>
        </h2>
        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
          Explore our top-rated courses offered across India by certified
          trainers and institutions.
        </p>
      </motion.div>

      <div className="relative max-w-7xl mx-auto">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          navigation={{
            nextEl: ".next-button",
            prevEl: ".prev-button",
          }}
          breakpoints={{
            0: { slidesPerView: 1 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {courses.slice(0, 6).map((course, index) => (
            <SwiperSlide key={index} className="p-1">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover={{ scale: 1.02 }}
                viewport={{ once: true, amount: 0.3 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden relative group"
              >
                <div className="h-48 w-full overflow-hidden">
                  <Link
                    href={`/course/${generateSlug(course?.course_name)}`}
                    className="group"
                  >
                    <div className="relative w-full aspect-[2/1] overflow-hidden">
                      <Image
                        src={
                          course?.image?.[0]
                            ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course?.image?.[0]}`
                            : "/img/default-images/campusaim-courses-featured.png"
                        }
                        alt={course?.course_name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </Link>
                </div>

                <div className="p-5 flex flex-col items-start">
                  <Link href={`/course/${generateSlug(course?.course_name)}`}>
                    <h3 className="font-semibold text-gray-800 text-lg group-hover:text-purple-700 transition-colors cursor-pointer mb-3 leading-tight truncate">
                      {course?.course_name}
                    </h3>
                  </Link>
                  <Link
                    href={`/course/${generateSlug(course?.course_name)}`}
                    className="text-purple-600 font-medium text-sm inline-flex items-center gap-1 hover:underline"
                  >
                    Read More
                    <LuArrowRight className="ml-1" />
                  </Link>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="prev-button absolute -left-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow hover:bg-purple-600 hover:text-white transition hidden md:block"
          aria-label="Previous"
        >
          <LuChevronLeft />
        </button>
        <button
          className="next-button absolute -right-8 top-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow hover:bg-purple-600 hover:text-white transition hidden md:block"
          aria-label="Next"
        >
          <LuChevronRight />
        </button>
      </div>
    </section>
  );
}
