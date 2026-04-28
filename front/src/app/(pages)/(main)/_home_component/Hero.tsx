"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { placeholderText } from "@/common/ExtraData";
import { SearchIcon } from "lucide-react";
import API from "@/context/API";
import SearchModal from "@/components/search_modal/SearchModal";

const HeroTags = [
  {
    title: "Colleges",
    href: "/colleges?category=college",
    external: false,
  },
  {
    title: "Universities",
    href: "/universities?category=university",
    external: false,
  },
  {
    title: "Community (Ask)",
    href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
    external: true,
  },
  {
    title: "Exams",
    href: "/exams",
    external: false,
  },
  {
    title: "Scholarships",
    href: "/scholarships",
    external: false,
  },
  {
    title: "Compare",
    href: "/compare/select",
    external: false,
  },
  // {
  // 	title: "Not Sure? Try Ask Prerna (Ai)",
  // 	href: "/ask-prerna",
  // 	external: false,
  // },
];
const texts = ["COLLEGES", "UNIVERSITIES", "ACADEMIES", "DEFENCE SCHOOLS"];

const colors = [
  "from-(--success) to-(--success-emphasis)",
  "from-(--blue) to-(--blue-emphasis)",
  "from-(--purple) to-(--purple-emphasis)",
  "from-(--danger) to-(--danger-emphasis)",
];
export function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const { value: rotatingPlaceholder } =
    useRotatingPlaceholder(placeholderText);
  const { value: rotatingText, index: rotatingTextIndex } =
    useRotatingPlaceholder(texts);

  useEffect(() => {
    const runBackgroundTask = () => {
      if (document.visibilityState === "visible") {
        API.patch("/property/slug/generate").catch(() => {});
      }
    };

    const timer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(runBackgroundTask);
      } else {
        runBackgroundTask();
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-(--primary-bg) text-(--text-color-emphasis) min-h-[80vh] sm:min-h-screen pt-10 sm:py-0 overflow-hidden flex justify-center items-center text-center">
      <div className="relative z-10 py-10 px-4 sm:px-8 h-full flex flex-col justify-center items-center text-center">
        {/* Heading Section */}
        <div className="w-full sm:my-6">
          <h1 className="flex flex-wrap justify-center items-center gap-2">
            <span className="text-xl md:text-4xl text-(--text-color-emphasis) font-semibold">
              Easily Find{" "}
            </span>

            <div className="overflow-hidden min-w-50">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingTextIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`text-2xl md:text-4xl font-semibold block  bg-linear-0! ${colors[rotatingTextIndex]} bg-clip-text text-transparent`}
                >
                  {rotatingText || texts[0]}
                </motion.span>
              </AnimatePresence>
            </div>
          </h1>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-6 md:mb-8">
          <h2 className="text-(--text-color) font-medium">
            Discover colleges and universities that match your academic goals.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto w-full mb-6 md:mb-8">
          <div
            className="w-full bg-(--primary-bg) border border-(--border) rounded-3xl sm:rounded-full shadow-custom cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <input
                readOnly
                type="text"
                aria-label="Search yoga institutes, courses, or trainers"
                placeholder={`Search "${rotatingPlaceholder || "Yoga Studio"}"`}
                className="bg-transparent outline-none text-sm px-6 py-4 cursor-pointer w-full placeholder:text-(-text-color-subtle) transition-colors duration-300"
              />

              <button
                type="button"
                aria-label="Search"
                className="btn-shine bg-(--main) text-( --main-extra) rounded-full px-6 py-2 flex items-center justify-center gap-2 m-1.5"
              >
                <SearchIcon className="w-5 h-5" aria-hidden="true" />
                <span className="hidden md:block font-medium">Search</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 md:mb-8">
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 max-w-3xl mx-auto">
            {HeroTags?.map((tag, index) => (
              <Link
                href={tag.href}
                key={index}
                title={tag?.title}
                target={tag.external ? "_blank" : "_self"}
                className="px-2 py-2 hover:underline text-(--text-color) transition-all duration-300 hover:text-(--main) text-xs md:text-sm whitespace-nowrap"
              >
                {tag.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {isOpen && (
        <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </section>
  );
}
