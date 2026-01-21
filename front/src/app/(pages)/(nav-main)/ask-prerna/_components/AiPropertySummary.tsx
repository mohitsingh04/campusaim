"use client";

import React from "react";
import {
  FaStar,
  FaArrowUpRightFromSquare,
  FaPaperPlane,
} from "react-icons/fa6";
import { LuTrendingUp, LuTrendingDown } from "react-icons/lu";
import Image from "next/image";
import { FaVolumeDown, FaVolumeUp } from "react-icons/fa";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { PropertyProps } from "@/types/PropertyTypes";
import { stripHtmlNoLimit } from "@/context/Callbacks";
import ReadMoreLessNoBlur from "@/ui/texts/ReadMoreLessNoBlur";
import HeadingLine from "@/ui/headings/HeadingLine";
import { BiCalendarAlt, BiMapPin } from "react-icons/bi";
import Badge from "@/ui/badge/Badge";

interface PropertySummaryProps {
  property: PropertyProps;
  setIsEnquiryModal: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AiPropertySummary = ({
  property,
  setIsEnquiryModal,
}: PropertySummaryProps) => {
  const { isSpeaking, speakText, stopSpeaking } = useTextToSpeech();

  // Optimized Logic from User Requirements
  const featuredImage = property?.featured_image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property?.featured_image[0]}`
    : "/img/default-images/yp-institutes.webp";

  const logoImage = property?.property_logo?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${property.property_logo[0]}`
    : "/img/default-images/yp-institutes.webp";

  const establishedYear = property?.est_year || "";

  const location = [
    property?.property_city,
    property?.property_state,
    property?.property_country,
  ]?.join(", ");

  return (
    <div className="w-full max-w-6xl mx-auto overflow-hidden flex flex-col space-y-6">
      {/* 1. Header Section: Identity & Featured Preview */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Left: Branding & Text */}
        <div className="flex-1 space-y-5">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-custom overflow-hidden border border-(--border) shrink-0">
              <Image
                src={logoImage}
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-(--text-color-emphasis) leading-tight">
                {property.property_name}
              </h1>
              <div className="flex flex-wrap gap-2 mt-1 capitalize">
                <Badge label={property?.property_type} />
                <Badge label={property?.academic_type} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-(--text-color)">
            {establishedYear && (
              <span className="flex items-center gap-2 px-2 py-1 text-xs bg-(--main-light) text-(--main-emphasis) rounded-full shadow-custom">
                <BiCalendarAlt className="w-4 h-4" /> Est.
                {establishedYear}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-2 px-2 py-1 text-xs bg-(--main-light) text-(--main-emphasis) rounded-full shadow-custom">
                <BiMapPin className="text-red-500" />
                {location}
              </span>
            )}
            {property?.property_description && (
              <button
                onClick={() =>
                  isSpeaking
                    ? stopSpeaking()
                    : speakText(
                        stripHtmlNoLimit(property?.property_description)
                      )
                }
                className="flex items-center gap-2 px-2 py-1 text-xs bg-(--main-light) text-(--main-emphasis) rounded-full shadow-custom hover:opacity-90 transition"
              >
                {isSpeaking ? (
                  <>
                    <FaVolumeDown /> Stop
                  </>
                ) : (
                  <>
                    <FaVolumeUp /> Listen Summary
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right: Smaller Featured Image (2/1 Aspect) */}
        <div className="w-full md:w-1/3 shrink-0">
          <div className="relative aspect-2/1 rounded-custom overflow-hidden shadow-custom border-2 border-(--border) group">
            <Image
              src={featuredImage}
              alt="Featured"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section>
            <HeadingLine title="Overview" />
            <div className="mt-4 text-(--text-color-emphasis) leading-relaxed">
              <ReadMoreLessNoBlur html={property?.property_description} />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {property?.gallery?.length > 0 && (
              <div className="space-y-4">
                <HeadingLine title="Gallery Preview" />
                <div className="grid grid-cols-2 gap-2">
                  {property.gallery.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-custom overflow-hidden bg-(--primary-color) group"
                    >
                      <Image
                        src={typeof img === "string" ? img : img.gallery?.[0]}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                        alt="Gallery"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {property?.certification?.length > 0 && (
              <div className="space-y-4">
                <HeadingLine title="Certification" />
                <div className="grid grid-cols-2 gap-2">
                  {property.certification.slice(0, 4).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-custom overflow-hidden bg-(--primary-color) group"
                    >
                      <Image
                        src={img}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                        alt="Certification"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar Dashboard (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Performance Dashboard */}
          <div className="bg-(--primary-bg) rounded-custom p-6 shadow-custom border border-(--border) space-y-6">
            <div className="text-center pb-4 border-b border-(--border)">
              <p className="text-xl uppercase tracking-widest font-bold text-(--text-color) mb-1">
                YP Rank
              </p>
              <div className="inline-flex items-center gap-2 text-3xl mt-2 font-black text-(--text-color-emphasis)">
                #{property?.rank}
                {(property?.rank || 0) < (property?.lastRank || 0) ? (
                  <LuTrendingUp className="text-green-500 w-6 h-6" />
                ) : (
                  <LuTrendingDown className="text-red-500 w-6 h-6" />
                )}
              </div>
            </div>

            <div className="flex justify-around items-center">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-xl font-bold text-(--text-color-emphasis)">
                  <FaStar className="text-(--warning)" />{" "}
                  {property?.average_rating}
                </div>
                <p className="text-sm text-(--text-color) font-medium">
                  Rating
                </p>
              </div>
              <div className="w-px h-8 bg-(--border)" />
              <div className="text-center">
                <div className="text-xl font-bold text-(--text-color-emphasis)">
                  {property.total_reviews}
                </div>
                <p className="text-sm text-(--text-color) font-medium">
                  Reviews
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsEnquiryModal(property?.property_slug)}
                className="w-full py-4 bg-(--text-color-emphasis) text-(--primary-bg) rounded-custom font-bold flex items-center justify-center gap-3 hover:shadow-custom hover:-translate-y-1 transition-all"
              >
                <FaPaperPlane /> Quick Enquiry
              </button>
              <a
                href={property?.property_url}
                target="_blank"
                className="w-full py-4 btn-shine rounded-custom font-bold flex items-center justify-center gap-3"
              >
                <FaArrowUpRightFromSquare /> Official Site
              </a>
            </div>
          </div>

          {/* Popular Courses */}
          {property?.courses?.length > 0 && (
            <div className="bg-(--primary-bg) rounded-custom p-6 shadow-custom border border-(--border)">
              <HeadingLine title="Top Courses" />
              <div className="space-y-4">
                {property.courses.slice(0, 3).map((course, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 group cursor-pointer hover:bg-(--secondary-bg) p-1 rounded-custom"
                  >
                    <div className="relative w-14 h-14 rounded-custom overflow-hidden shrink-0">
                      <Image
                        src={
                          course.image?.[0]
                            ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${course.image?.[0]}`
                            : "/img/default-images/yp-yoga-courses.webp"
                        }
                        fill
                        className="object-cover"
                        alt="course"
                      />
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-bold text-(--text-color-emphasis) truncate group-hover:text-(--main) transition-colors">
                        {course.course_name}
                      </p>
                      <p className="text-xs text-(--text-color) font-medium">
                        {course.duration}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
