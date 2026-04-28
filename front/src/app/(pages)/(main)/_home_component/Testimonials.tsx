"use client";

import { FeedbackData } from "@/common/FeedbackData";
import { originalTestimonials } from "@/common/TestimonialsData";
import { HeadingProps } from "@/ui/headings/MainHeading";
import { QuoteIcon, StarIcon, UserRound } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";

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

  const getSentimentEmoji = (score: number, size: number = 20) => {
    const index = Math.max(0, Math.min(4, Math.round(score) - 1));
    const feedback = FeedbackData[index];
    const Icon = feedback.icon;
    return (
      <div className={`flex items-center gap-1.5 ${feedback.color}`}>
        <Icon size={size} />
      </div>
    );
  };

  const translateY = activeIndex * ITEM_HEIGHT - ITEM_HEIGHT;

  return (
    <section className="py-10 px-4 sm:px-8 bg-(--primary-bg)">
      <div className="flex flex-col md:flex-row justify-between sm:items-end items-start mb-10 gap-6">
        <div className="w-full md:w-2/3">
          <HeadingProps
            tag="Don't just take our word for it"
            title="Loved by "
            activetitle="Thousands"
            subtitle="Hear how our platform helps students to find their perfect education."
          />{" "}
        </div>
        {/* <Link
          href="/testimonials"
          className="md:flex hidden items-center gap-2 text-(--main-emphasis) hover:text-(--main) font-bold transition-all duration-300 text-sm"
        >
          View All Testimonials
          <ArrowRight size={18} />
        </Link> */}
      </div>

      <div className="w-full mt-8 flex justify-center">
        <div
          className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:gap-14 items-center md:items-start justify-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="relative w-full md:w-5/12 overflow-hidden shrink-0 z-0"
            style={{ height: `${CONTAINER_HEIGHT}px` }}
          >
            <div className="absolute top-0 left-0 right-0 h-16 sm:h-20 bg-linear-to-b from-(--primary-bg) via-(--primary-bg)/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-linear-to-t from-(--primary-bg) via-(--primary-bg)/80 to-transparent z-20 pointer-events-none" />

            {/* MOVING LIST */}
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                transform: `translateY(-${translateY}px)`,
                transition: isTransitioning
                  ? "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)"
                  : "none",
              }}
            >
              {testimonials.map((item, index) => (
                <TestimonialAvatarItem
                  key={index}
                  item={item}
                  isActive={index === activeIndex}
                  onClick={() => {
                    setIsTransitioning(true);
                    setActiveIndex(index);
                  }}
                  getSentimentEmoji={getSentimentEmoji}
                />
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: MAIN QUOTE (desktop & up) */}
          <div className="w-full md:w-7/12 hidden md:block relative min-h-75 px-2 md:pl-8">
            <QuoteIcon className="absolute -top-8 -left-4 text-(--text-color-subtle)/30 w-28 h-28 rotate-180 opacity-20" />
            <div className="relative z-10 w-full max-w-2xl">
              <div
                key={currentTestimonial?.id}
                className="animate-fade-in-up text-(--text-color)"
              >
                {/* Quote Text */}
                <div className="mb-8">
                  <div className="flex gap-2">
                    <span className="text-5xl md:text-6xl font-serif font-bold float-left mr-3 leading-none h-8 -mt-2">
                      <QuoteIcon className="text-(--text-color-subtle)" />
                    </span>
                    <p className="text-lg font-semibold leading-relaxed">
                      {currentTestimonial?.text}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 my-3">
                  <div className="flex items-center gap-1">
                    {Array.from({
                      length: Math.round(currentTestimonial?.rating || 5),
                    }).map((_, idx) => (
                      <StarIcon
                        key={idx}
                        size={18}
                        className="fill-(--warning) text-(--warning)"
                      />
                    ))}
                  </div>
                </div>
                <div className="h-1 w-24 bg-(--main) rounded-full mb-3" />
                <div>
                  <h3 className="text-xl font-bold text-(--text-color-emphasis)">
                    {currentTestimonial?.name}
                  </h3>
                  <p className="text-sm font-semibold text-gradient uppercase tracking-widest mt-1">
                    {currentTestimonial?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
    </section>
  );
};

const TestimonialAvatarItem = React.memo(
  ({ item, isActive, onClick, getSentimentEmoji }: any) => {
    return (
      <div
        onClick={onClick}
        className="relative flex items-center gap-4 sm:gap-6 cursor-pointer group transition-all duration-500 ease-out pl-2"
        style={{ height: `${ITEM_HEIGHT}px` }}
      >
        <div
          className={`relative rounded-full border-4 overflow-hidden shrink-0 transition-all duration-500 flex items-center justify-center bg-(--main) 
        ${isActive ? "w-20 h-20 sm:w-24 sm:h-24 border-(--main) shadow-lg scale-105 md:translate-x-10" : "w-14 h-14 sm:w-16 sm:h-16 border-transparent opacity-40 grayscale group-hover:opacity-80"}`}
        >
          {item?.image ? (
            <Image
              src={item?.image}
              alt={item?.name}
              fill
              sizes="96px"
              className="object-cover"
              priority
              fetchPriority="high"
              quality={80}
            />
          ) : (
            <UserRound className="w-full h-full text-(--main-subtle) border-4 border-(--main-subtle) rounded-full" />
          )}
        </div>
        <div
          className={`flex flex-col transition-all duration-500 origin-left ${isActive ? "opacity-100 md:translate-x-8 scale-100" : "opacity-40 -translate-x-2 scale-95"}`}
        >
          <h3
            className={`font-semibold text-(--text-color-emphasis) ${isActive ? "text-lg sm:text-xl" : "text-base"}`}
          >
            {item?.name}
          </h3>
          {isActive && (
            <p className="block md:hidden text-(--text-color) text-sm mt-1 leading-relaxed line-clamp-2">
              {item?.text}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {getSentimentEmoji(item?.rating)}
            <span className="text-xs text-(--text-color) opacity-60">
              {item.role}
            </span>
          </div>
        </div>
      </div>
    );
  },
);

TestimonialAvatarItem.displayName = "TestimonialAvatarItem";

export default Testimonials;
