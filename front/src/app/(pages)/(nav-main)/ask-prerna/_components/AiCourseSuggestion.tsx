import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { BsBuilding, BsEnvelope, BsEye, BsRobot } from "react-icons/bs";
import { FaVolumeUp } from "react-icons/fa";
import { FaVolumeXmark } from "react-icons/fa6";

import { CourseProps } from "@/types/Types";
import { stripHtmlNoLimit } from "@/context/Callbacks";
import { useTheme } from "@/hooks/useTheme";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import AiCourseEnquiryModal from "./AiCourseEnquiryModal";

export default function AiCourseSuggestion({
  course,
  index,
}: {
  course: CourseProps[];
  index?: number;
}) {
  const { isSpeaking, speakText, stopSpeaking } = useTextToSpeech();
  const { theme } = useTheme();
  const [enquiryCourse, setEnquiryCourse] = useState<CourseProps | null>(null);

  return (
    <div className="w-full max-w-[calc(100vw-48px)] sm:max-w-7xl mx-auto">
      <div className="relative">
        {/* Navigation */}
        <button
          className={`prev-button-${index} hidden sm:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-(--primary-bg) text-(--text-color-emphasis) shadow hover:opacity-80`}
        >
          <LuChevronLeft className="w-5 h-5" />
        </button>

        <button
          className={`next-button-${index} hidden sm:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-(--primary-bg) text-(--text-color-emphasis) shadow hover:opacity-80`}
        >
          <LuChevronRight className="w-5 h-5" />
        </button>

        <Swiper
          modules={[Autoplay, Navigation]}
          navigation={{
            prevEl: `.prev-button-${index}`,
            nextEl: `.next-button-${index}`,
          }}
          autoplay={{ delay: 4500, pauseOnMouseEnter: true }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {course.map((item, idx) => {
            const cleanText = stripHtmlNoLimit(item?.description || "");
            // Ensure possibly dynamic fields are treated as strings for JSX rendering
            const courseType = item?.course_type as string | undefined;
            const courseLevel = item?.course_level as string | undefined;

            return (
              <SwiperSlide key={idx}>
                <div className="h-full bg-(--primary-bg) rounded-custom border border-(--secondary-bg) shadow-custom overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-lg">
                  {/* Media */}
                  <div className="relative h-40">
                    {item.image?.[0] ? (
                      <Image
                        fill
                        src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${item.image[0]}`}
                        alt={item.course_name || "Course image"}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-(--secondary-bg) flex items-center justify-center">
                        <BsBuilding className="text-3xl text-(--text-color-emphasis)" />
                      </div>
                    )}

                    {/* Speak */}
                    <button
                      onClick={
                        isSpeaking ? stopSpeaking : () => speakText(cleanText)
                      }
                      className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-(--text-color-emphasis) text-(--primary-bg) shadow hover:opacity-80"
                      title="Speak"
                    >
                      {isSpeaking ? (
                        <FaVolumeXmark className="w-4 h-4" />
                      ) : (
                        <FaVolumeUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 gap-3">
                    {/* Title */}
                    <div className="flex items-start gap-2">
                      {item?.course_slug ? (
                        <Link
                          href={`/course/${item.course_slug}`}
                          target="_blank"
                          className="font-semibold text-sm leading-snug text-(--text-color-emphasis) hover:underline line-clamp-2 flex-1"
                        >
                          {item.course_name}
                        </Link>
                      ) : (
                        <h2> {item.course_name}</h2>
                      )}
                      {item.course_slug ? (
                        <div className="w-5  h-5 relative shrink-0 bg-(--text-color-emphasis) rounded">
                          <Image
                            fill
                            src={
                              theme === "light"
                                ? "/img/logo/logo-small-white.png"
                                : "/img/logo/logo-small-black.png"
                            }
                            alt="Company Logo"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <BsRobot className="w-5 h-5 text-(--text-color-emphasis)" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-(--text-color)">
                      {courseType && (
                        <span className="px-2 py-1 rounded bg-(--secondary-bg)">
                          {courseType}
                        </span>
                      )}
                      {courseLevel && (
                        <span className="px-2 py-1 rounded bg-(--secondary-bg)">
                          {courseLevel}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <div
                        className="text-xs text-(--text-color) line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: item.description,
                        }}
                      />
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {item.course_slug && (
                      <div className="flex gap-2 pt-3">
                        <button
                          onClick={() => setEnquiryCourse(item)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-custom text-sm bg-(--secondary-bg) text-(--text-color) hover:opacity-80"
                        >
                          <BsEnvelope className="w-4 h-4" />
                          Enquiry
                        </button>

                        <Link
                          href={`/course/${item.course_slug}`}
                          target="_blank"
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-custom text-sm btn-shine"
                        >
                          <BsEye className="w-4 h-4" />
                          View
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
      {enquiryCourse && (
        <AiCourseEnquiryModal
          course={enquiryCourse}
          closeModal={() => setEnquiryCourse(null)}
        />
      )}
    </div>
  );
}
