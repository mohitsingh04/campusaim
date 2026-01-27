import API from "@/context/API";
import { getErrorResponse, isDateEnded } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import { CourseProps, EventProps } from "@/types/Types";
import React, { useCallback, useEffect, useState } from "react";
import CountUp from "react-countup";

const StatsSection = () => {
  const [property, setProperty] = useState<PropertyProps[]>([]);
  const [course, setCourse] = useState<CourseProps[]>([]);
  const [events, setEvents] = useState<EventProps[]>([]);
  const [loading, setLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        API.get("/property"),
        API.get("/course"),
        API.get("/event"),
      ]);

      const [propertyRes, courseRes, eventRes] = results;

      if (propertyRes.status === "fulfilled") {
        const propertyData = propertyRes.value?.data || [];
        setProperty(
          propertyData.filter((item: PropertyProps) => item.status === "Active")
        );
      }

      if (courseRes.status === "fulfilled") {
        const courseData = courseRes.value?.data || [];
        setCourse(
          courseData.filter((item: CourseProps) => item.status === "Active")
        );
      }

      if (eventRes.status === "fulfilled") {
        const eventData = eventRes.value?.data || [];
        const activeEvents = eventData.filter((event: EventProps) => {
          if (event?.status !== "Active") return false;
          return isDateEnded(
            event?.schedule?.[event?.schedule?.length - 1]?.date
          );
        });
        setEvents(activeEvents);
      }
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const stats = [
    {
      number: property.length,
      title: "Verified Institutions",
      description:
        "Accredited colleges and universities providing recognized academic programs.",
    },
    {
      number: course.length,
      title: "Academic Programs",
      description:
        "Undergraduate, postgraduate, diploma, and doctoral courses across multiple disciplines.",
    },
    {
      number: events.length,
      title: "Student Users",
      description:
        "Students and learners using Campusaim to research colleges and academic options.",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-8 relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col items-center px-4 py-8 md:py-0"
          >
            <h2 className="text-6xl font-black mb-4 bg-clip-text text-transparent bg-(--main)">
              {loading ? (
                "0+"
              ) : (
                <>
                  <CountUp start={0} end={stat.number} duration={2} />+
                </>
              )}
            </h2>

            <h3 className="sub-heading font-bold mb-3 text-(--text-color-emphasis) uppercase tracking-wider text-sm font-serif">
              {stat.title}
            </h3>

            <p className="leading-relaxed max-w-xs mx-auto">
              {stat.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
