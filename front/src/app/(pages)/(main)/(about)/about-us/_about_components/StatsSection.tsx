"use client";
import { originalTestimonials } from "@/common/TestimonialsData";
import API from "@/context/API";
import {
  generateSlug,
  getAverageRating,
  getErrorResponse,
} from "@/context/Callbacks";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import { PropertyProps } from "@/types/PropertyTypes";
import { CourseProps, EventProps } from "@/types/Types";
import React, { useCallback, useEffect, useState } from "react";

const StatsSection = () => {
  const [property, setProperty] = useState<PropertyProps[]>([]);
  const [course, setCourse] = useState<CourseProps[]>([]);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCategoryById } = useGetAssets();

  const getData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        API.get("/property"),
        API.get("/course"),
        API.get("/exam"),
      ]);

      const [propertyRes, courseRes, eventRes] = results;

      if (propertyRes.status === "fulfilled") {
        const propertyData = propertyRes.value?.data || [];
        const finalData = propertyData
          ?.map((item: PropertyProps) => {
            if (item.status !== "Active") return null;
            return {
              ...item,
              academic_type: getCategoryById(item?.academic_type),
            };
          })
          .filter(Boolean);
        setProperty(finalData as PropertyProps[]);
      }

      if (courseRes.status === "fulfilled") {
        const courseData = courseRes.value?.data || [];
        setCourse(
          courseData.filter((item: CourseProps) => item.status === "Active"),
        );
      }

      if (eventRes.status === "fulfilled") {
        const eventData = eventRes.value?.data || [];
        setEvents(eventData);
      }
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  }, [getCategoryById]);

  useEffect(() => {
    getData();
  }, [getData]);

  const stats = [
    {
      number: property?.filter(
        (item) =>
          generateSlug(item?.academic_type) === generateSlug("college") ||
          generateSlug(item?.academic_type) === generateSlug("university"),
      ).length,
      title: "College & University",
      description:
        "Explore trusted colleges and universities offering quality education and strong career opportunities.",
    },
    {
      number: property?.filter(
        (item) => generateSlug(item?.academic_type) === generateSlug("school"),
      ).length,
      title: "Schools",
      description:
        "Find top schools with strong academics, experienced faculty, and holistic development programs.",
    },
    {
      number: property?.filter(
        (item) =>
          generateSlug(item?.academic_type) === generateSlug("coaching"),
      ).length,
      title: "Coaching Institutes",
      description:
        "Discover coaching institutes for competitive exams and career-focused learning.",
    },
    {
      number: course.length,
      title: "Academic Programs",
      description:
        "Browse undergraduate, postgraduate, diploma, and certification courses.",
    },
    {
      number: events.length,
      title: "Entrance Exams",
      description:
        "Stay updated with major entrance exams for colleges and professional courses.",
    },
    {
      number: getAverageRating(originalTestimonials),
      title: "Student Reviews",
      description:
        "Read genuine student experiences before choosing your institution.",
    },
  ];

  return (
    <section className="py-12 px-4 sm:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-(--secondary-bg) rounded-custom p-8 shadow-custom text-center group"
          >
            <h2 className="text-5xl font-black mb-4 text-(--main)">
              {loading ? "0+" : `${stat.number}+`}
            </h2>
            <h3 className="text-sm font-semibold tracking-widest uppercase text-(--text-color-emphasis) mb-3">
              {stat.title}
            </h3>
            <p className="text-sm leading-relaxed text-(--text-color)">
              {stat.description}
            </p>

            <div className="mt-6 h-1 w-0 bg-(--main) group-hover:w-full transition-all duration-300" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
