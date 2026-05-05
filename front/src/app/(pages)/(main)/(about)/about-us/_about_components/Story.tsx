"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BadgeBorder from "@/ui/badge/BadgeBorder";

const timelineData = [
  {
    year: 2020,
    title: "The Beginning",
    subtitle: "Vision & Planning",
    description:
      "Campusaim started with a simple vision — to create a platform where students could easily discover colleges, courses, and academic opportunities without confusion.",
  },
  {
    year: 2021,
    title: "Platform Development",
    subtitle: "Building the Foundation",
    description:
      "We began developing a structured education platform focused on clear information, better user experience, and organized academic data for students.",
  },
  {
    year: 2022,
    title: "Expanding Educational Categories",
    subtitle: "Schools, Colleges & Courses",
    description:
      "Campusaim expanded its platform by adding schools, colleges, universities, coaching institutes, entrance exams, and multiple academic programs.",
  },
  {
    year: 2023,
    title: "Student-Focused Improvements",
    subtitle: "Better Guidance & Information",
    description:
      "We improved course details, admission information, exam updates, and educational resources to help students make smarter academic decisions.",
  },
  {
    year: 2024,
    title: "Growing Educational Ecosystem",
    subtitle: "Supporting Student Success",
    description:
      "Campusaim continues to grow as an education discovery platform dedicated to providing reliable guidance, trusted information, and better opportunities for students.",
  },
  {
    year: 2025,
    title: "Expanding Student Opportunities",
    subtitle: "Smarter Education Discovery",
    description:
      "Campusaim enhanced its platform with more institutions, updated course information, entrance exam resources, and student-focused educational guidance.",
  },
  {
    year: 2026,
    title: "Building a Trusted Education Platform ",
    subtitle: "Empowering Future Learners",
    description:
      "Campusaim continues strengthening its education ecosystem by helping students explore trusted schools, colleges, courses, and career opportunities with confidence.",
  },
];

export default function YogaTimeline() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.children[
        activeIndex
      ] as HTMLElement;
      if (activeElement) {
        const containerWidth = scrollContainerRef.current.offsetWidth;
        const itemWidth = activeElement.offsetWidth;
        const itemLeft = activeElement.offsetLeft;

        scrollContainerRef.current.scrollTo({
          left: itemLeft - containerWidth / 2 + itemWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex]);

  return (
    <section className="relative py-14 px-4 sm:px-8 bg-(--primary-bg) overflow-hidden">
      <div className="w-full flex flex-col gap-8">
        <div className="flex flex-col items-start text-start space-y-5">
          <BadgeBorder label="Our Journey" />
          <div className="relative">
            <h2 className="heading-lg mb-4 text-(--text-color-emphasis) font-semibold">
              From Vision to Building Smarter Education Discovery: 2020–2026
            </h2>
            <p className="max-w-xl pt-2 text-(--text-color)">
              A journey focused on simplifying education discovery, helping
              students explore trusted institutions, courses, and career
              opportunities with confidence.
            </p>
          </div>
        </div>

        <div className="relative w-full">
          <div className="absolute top-[38px] left-0 w-full h-0.5 bg-(--border) rounded-full" />

          <div
            className="absolute top-[38px] left-0 h-0.5 bg-(--main) rounded-full transition-all duration-500"
            style={{
              width: `${(activeIndex / (timelineData.length - 1)) * 100}%`,
            }}
          />

          <div
            ref={scrollContainerRef}
            className="flex w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide items-start py-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {timelineData.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.year}
                  onClick={() => setActiveIndex(index)}
                  className="shrink-0 w-1/3 md:w-1/4 snap-center flex flex-col items-center gap-3 relative focus:outline-none pt-2 group cursor-pointer"
                >
                  <div className="relative flex items-center justify-center">
                    {isActive && (
                      <motion.div
                        layoutId="activeGlow"
                        className="absolute w-6 h-6 rounded-full bg-(--main-subtle) border border-(--main) shadow-custom"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                      />
                    )}

                    <div
                      className={`w-3 h-3 rounded-full z-10 transition-all duration-300 border-2 ${
                        isActive
                          ? "bg-(--main) border-(--main) scale-125"
                          : "bg-(--primary-bg) border-(--border) group-hover:border-(--main)"
                      }`}
                    />
                  </div>

                  <span
                    className={`text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "text-(--main) scale-110"
                        : "text-(--text-color) group-hover:text-(--main)"
                    }`}
                  >
                    {item.year}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full relative px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-(--secondary-bg) rounded-custom p-8 md:p-12 shadow-custom relative overflow-hidden mx-auto"
            >
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                <div className="shrink-0">
                  <BadgeBorder label={`${timelineData[activeIndex].year}`} />
                </div>
                <div className="space-y-3 max-w-2xl">
                  <h2 className="heading-lg font-bold text-(--text-color-emphasis)">
                    {timelineData[activeIndex].title}
                  </h2>
                  <h4 className="font-semibold text-(--text-color-emphasis)">
                    {timelineData[activeIndex].subtitle}
                  </h4>
                  <p className="text-(--text-color) text-lg leading-relaxed">
                    {timelineData[activeIndex].description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
