"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  BackpackIcon,
  BookOpenTextIcon,
  CircleQuestionMarkIcon,
  GraduationCapIcon,
  NotebookPenIcon,
  ScaleIcon,
  SchoolIcon,
  SearchIcon,
  UniversityIcon,
} from "lucide-react";
import Link from "next/link";
import SearchModal from "@/components/search_modal/SearchModal";
import { useRotatingPlaceholder } from "@/hooks/useRotatingPlaceholder";
import { placeholderText } from "@/common/ExtraData";
import API from "@/context/API";

const HeroTags = [
  {
    title: "Colleges",
    href: "/colleges",
    external: false,
    icon: <GraduationCapIcon className="w-4 h-4 text-(--success)" />,
  },
  {
    title: "Universities",
    href: "/universities",
    external: false,
    icon: <UniversityIcon className="w-4 h-4 text-(--danger)" />,
  },
  {
    title: "schools",
    href: "/schools",
    external: false,
    icon: <SchoolIcon className="w-4 h-4 text-(--warning)" />,
  },
  {
    title: "coachings",
    href: "/coachings",
    external: false,
    icon: <BackpackIcon className="w-4 h-4 text-(--blue)" />,
  },
  {
    title: "courses",
    href: "/courses",
    external: false,
    icon: <BookOpenTextIcon className="w-4 h-4 text-(--orange)" />,
  },
  {
    title: "Exams",
    href: "/exams",
    external: false,
    icon: <NotebookPenIcon className="w-4 h-4 text-(--pink)" />,
  },
  {
    title: "Community (Ask)",
    href: `${process.env.NEXT_PUBLIC_ASK_URL}`,
    external: true,
    icon: <CircleQuestionMarkIcon className="w-4 h-4 text-(--purple)" />,
  },
  {
    title: "Compare",
    href: "/compare/select",
    external: false,
    icon: <ScaleIcon className="w-4 h-4 text-(--success)" />,
  },
];

export function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const { value: rotatingPlaceholder } =
    useRotatingPlaceholder(placeholderText);

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
    <div>
      <div className="px-6 md:px-10 py-5 md:py-0! bg-(--primary-bg) mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl 2xl:text-5xl font-bold text-(--text-color-emphasis) leading-tight">
              Your Education Journey <br />
              <span className="text-gradient">Starts With Campusaim</span>
            </h1>

            <p className="mt-4 text-(--text-color) text-sm max-w-xl">
              Discover top colleges, universities, schools & academies in India.
              Compare courses, fees & locations easily with the Campusaim
              platform.
            </p>

            <div
              onClick={() => setIsOpen(!isOpen)}
              className="mt-6 flex items-center bg-(--secondary-bg) rounded-custom border border-(--border) p-2 max-w-xl"
            >
              <input
                type="text"
                aria-label="Search College, University, courses, or exams"
                placeholder={`Search "${rotatingPlaceholder || "College"}"`}
                className="flex-1 bg-transparent outline-none cursor-pointer  w-full px-4 py-2 text-sm placeholder:text-(--text-subtle) transition-colors duration-300"
              />
              <button
                type="button"
                aria-label="Search"
                className="btn-shine bg-(--main) text-sm! text-( --main-extra) rounded-custom px-6 py-2 flex items-center justify-center gap-2 shrink-0"
              >
                <SearchIcon className="w-5 h-5" aria-hidden="true" />
                <span className="hidden md:block font-medium">Search</span>
              </button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 max-w-xl">
              <span className="text-xs font-semibold text-(--text-color) uppercase tracking-wider mr-1">
                Popular:
              </span>
              {HeroTags?.map((tag, index) => (
                <Link
                  href={tag.href}
                  key={index}
                  title={tag?.title}
                  target={tag.external ? "_blank" : "_self"}
                  className="px-3 py-1.5 bg-(--secondary-bg) border border-(--border) rounded-custom text-sm font-medium text-(--text-color) transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1"
                >
                  {tag?.icon}
                  {tag.title}
                </Link>
              ))}
            </div>
          </div>

          <div className="relative">
            <Image
              src="/img/testimonials/student-test.webp"
              alt="Hero student"
              width={600}
              height={600}
              priority
              fetchPriority="high"
              loading="eager"
              decoding="sync"
              quality={80}
              sizes="(max-width: 768px) 1px, (max-width: 1200px) 40vw, 480px"
              className="relative z-10 object-cover"
            />

            <div className="absolute top-10 left-0 z-0  w-full h-full pointer-events-none">
              <svg viewBox="0 0 500 200" className="w-full">
                <defs>
                  <linearGradient
                    id="waveGradient1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="var(--main)" />
                    <stop offset="50%" stopColor="var(--main-emphasis)" />
                    <stop offset="100%" stopColor="var(--main-subtle)" />
                  </linearGradient>

                  <linearGradient
                    id="waveGradient2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="var(--main-emphasis)" />
                    <stop offset="50%" stopColor="var(--main-extra)" />
                    <stop offset="100%" stopColor="var(--main-subtle)" />
                  </linearGradient>
                </defs>

                <path
                  d="M0 100 Q150 0 300 100 T600 100"
                  stroke="url(#waveGradient1)"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />

                <path
                  d="M0 120 Q150 20 300 120 T600 120"
                  stroke="url(#waveGradient2)"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />

                <path
                  d="M0 140 Q150 40 300 140 T600 140"
                  stroke="url(#waveGradient1)"
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* FLOATING CIRCLES */}
            <div className="absolute top-6 right-10 w-16 h-16 rounded-full overflow-hidden shadow-lg">
              <Image
                src="/img/testimonials/user-1.webp"
                alt="student 1"
                width={50}
                height={50}
                priority
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                quality={80}
                sizes="(max-width: 768px) 1px, (max-width: 1200px) 40vw, 480px"
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute top-24 left-4 w-12 h-12 rounded-full overflow-hidden shadow-lg">
              <Image
                src="/img/testimonials/user-2.webp"
                alt="student 2"
                width={50}
                height={50}
                priority
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                quality={80}
                sizes="(max-width: 768px) 1px, (max-width: 1200px) 40vw, 480px"
                className="object-cover w-full h-full"
              />
            </div>

            <div className="absolute top-32 right-0 w-14 h-14 rounded-full overflow-hidden shadow-lg">
              <Image
                src="/img/testimonials/user-3.webp"
                alt="student 3"
                width={50}
                height={50}
                priority
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                quality={80}
                sizes="(max-width: 768px) 1px, (max-width: 1200px) 40vw, 480px"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
