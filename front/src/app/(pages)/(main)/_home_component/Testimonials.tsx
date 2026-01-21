"use client";

import { originalTestimonials } from "@/common/TestimonialsData";
import { HeadingProps } from "@/ui/headings/MainHeading";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { BsQuote, BsStarFill } from "react-icons/bs";

const ITEM_HEIGHT = 120;
const VISIBLE_SLOTS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_SLOTS;

const Testimonials = () => {
  const testimonials = [
    ...originalTestimonials,
    ...originalTestimonials,
    ...originalTestimonials,
  ];
  const totalItems = originalTestimonials.length;

  const [activeIndex, setActiveIndex] = useState(totalItems);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const currentTestimonial = originalTestimonials[activeIndex % totalItems];

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setActiveIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isTransitioning) return;

    const transitionDuration = 500;

    const timeout = setTimeout(() => {
      if (activeIndex >= totalItems * 2) {
        setIsTransitioning(false);
        setActiveIndex(activeIndex - totalItems);
      } else if (activeIndex < totalItems) {
        setIsTransitioning(false);
        setActiveIndex(activeIndex + totalItems);
      }
    }, transitionDuration);

    return () => clearTimeout(timeout);
  }, [activeIndex, isTransitioning, totalItems]);

  useEffect(() => {
    if (!isTransitioning) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
        });
      });
    }
  }, [isTransitioning]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 3500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const translateY = activeIndex * ITEM_HEIGHT - ITEM_HEIGHT;

  return (
    <section className="py-10 px-4 sm:px-8 bg-(--primary-bg)">
      <HeadingProps
        tag="Don't just take our word for it"
        title="Loved by "
        activetitle="Thousands"
        subtitle="Hear how our platform helps studios grow and students find their perfect yoga education."
      />

      <div className="w-full mt-8 flex justify-center text-slate-800">
        <div
          className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:gap-14 items-center md:items-start justify-center px-2 sm:px-4 md:px-0"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* LEFT SIDE: SCROLLING AVATAR LIST */}
          <div
            className="relative w-full md:w-5/12 overflow-hidden shrink-0 z-0"
            style={{ height: `${CONTAINER_HEIGHT}px` }}
          >
            {/* Top gradient mask */}
            <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-linear-to-b from-(--primary-bg) via-(--primary-bg)/80 to-transparent z-20 pointer-events-none" />
            {/* Bottom gradient mask */}
            <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-linear-to-t from-(--primary-bg) via-(--primary-bg)/80 to-transparent z-20 pointer-events-none" />

            {/* MOVING LIST */}
            <div
              className="absolute top-0 left-0 w-full z-1"
              style={{
                transform: `translateY(-${translateY}px)`,
                transition: isTransitioning
                  ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
                  : "none",
              }}
            >
              {testimonials.map((item, index) => {
                const isActive = index === activeIndex;
                const dist = Math.abs(index - activeIndex);
                const isVisible = dist <= 2;

                if (!isVisible)
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      style={{ height: ITEM_HEIGHT }}
                    />
                  );

                return (
                  <div
                    key={`${item.id}-${index}`}
                    onClick={() => {
                      setIsTransitioning(true);
                      setActiveIndex(index);
                    }}
                    className="relative flex items-center gap-4 sm:gap-6 cursor-pointer group transition-all duration-500 ease-out pl-2 sm:pl-4"
                    style={{ height: `${ITEM_HEIGHT}px` }}
                  >
                    {/* Avatar */}
                    <div
                      className={`relative rounded-full border-3 overflow-hidden shrink-0 transition-all duration-500
                        ${
                          isActive
                            ? "w-20 h-20 sm:w-24 sm:h-24 border-(--main) shadow-lg scale-105 translate-x-0 md:translate-x-10"
                            : "w-14 h-14 sm:w-16 sm:h-16 border-transparent opacity-40 grayscale group-hover:opacity-80 z-10"
                        }
                      `}
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="object-cover"
                        fill
                      />
                    </div>

                    {/* Name + Rating + Mobile text */}
                    <div
                      className={`flex flex-col transition-all duration-500 origin-left
                        ${
                          isActive
                            ? "opacity-100 translate-x-0 md:translate-x-8 scale-100"
                            : "opacity-40 -translate-x-2 scale-95"
                        }
                      `}
                    >
                      <h4
                        className={`font-semibold text-(--text-color-emphasis) ${
                          isActive ? "text-lg sm:text-xl" : "text-base"
                        }`}
                      >
                        {item.name}
                      </h4>

                      {/* Mobile-only text preview */}
                      {isActive && (
                        <p className="block md:hidden text-(--text-color) text-sm mt-1 leading-relaxed">
                          {currentTestimonial.text}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          <BsStarFill size={14} className="fill-(--warning)" />
                          <span className="ml-1 text-sm font-bold text-(--text-color)">
                            {item.rating}
                          </span>
                        </div>
                        <span className="text-xs text-(--text-color)">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDE: MAIN QUOTE (desktop & up) */}
          <div className="w-full md:w-7/12 hidden md:block relative min-h-[300px] px-2 sm:px-4 md:pl-8">
            <BsQuote className="absolute -top-8 -left-4 sm:-left-6 text-(--secondary-bg) w-28 h-28 sm:w-36 sm:h-36 rotate-180 opacity-60" />

            <div className="relative z-10 w-full max-w-2xl">
              <div
                key={activeIndex}
                className="animate-fade-in-up text-(--text-color)"
              >
                {/* Quote Text */}
                <div className="mb-8">
                  <div className="flex gap-2">
                    <span className="text-5xl md:text-6xl font-serif font-bold float-left mr-3 leading-none h-8 -mt-2">
                      <BsQuote />
                    </span>
                    <p className="italic">{currentTestimonial.text}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <p>{currentTestimonial.date}</p>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-2 my-3">
                  {Array.from({
                    length: Math.round(currentTestimonial.rating),
                  }).map((_, idx) => (
                    <BsStarFill
                      key={idx}
                      size={18}
                      className="fill-(--warning)"
                    />
                  ))}
                </div>

                <div className="h-1 w-24 bg-(--main) rounded-full mb-3" />

                {/* Author Info */}
                <div>
                  <h3 className="text-xl font-bold text-(--text-color-emphasis)">
                    {currentTestimonial.name}
                  </h3>
                  <p className="text-sm font-semibold text-(--main) uppercase tracking-widest mt-1">
                    {currentTestimonial.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(15px); 
            }
            to { 
              opacity: 1; 
              transform: translateY(0); 
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          }
        `}</style>
      </div>
    </section>
  );
};

export default Testimonials;
