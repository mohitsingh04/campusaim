"use client";

import React, { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import { useQuery } from "@tanstack/react-query";

import { HeadingProps } from "@/ui/headings/MainHeading";
import Link from "next/link";
import { generateSlug } from "@/context/Callbacks";
import Image from "next/image";
import API from "@/context/API";
import LocationSkeleton from "@/ui/loader/page/landing/_components/LocationSkeleton";
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

type LocationPair = {
  city: string;
  state: string;
  country: string;
  count: number;
};

const locationsImages = [
  "/img/browse-by-locations/dehradun.webp",
  "/img/browse-by-locations/rishikesh.webp",
  "/img/browse-by-locations/bengalore.webp",
  "/img/browse-by-locations/mysuru.webp",
  "/img/browse-by-locations/chennai.webp",
  "/img/browse-by-locations/dharamsala.webp",
  "/img/browse-by-locations/varkala.webp",
  "/img/browse-by-locations/south-goa.webp",
  "/img/browse-by-locations/varanshi.webp",
  "/img/browse-by-locations/new-delhi.webp",
];

export default function BrowseByLocation() {
  const swiperRef = useRef<SwiperType | null>(null);

  const { data: locations = [], isLoading } = useQuery<LocationPair[]>({
    queryKey: ["browse-locations"],
    queryFn: async () => {
      const res = await API.get(
        "/property/unique/location/pairs?limit=10&sort=desc",
      );
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <LocationSkeleton />;
  if (locations.length <= 0) return null;

  return (
    <section className="relative py-10 px-4 sm:px-8 bg-(--primary-bg) overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
          <HeadingProps
            tag="Explore Institutes Across India"
            title="Browse by "
            activetitle="Location"
            subtitle="Find top institutes in your preferred city and state."
          />

          <div className="hidden sm:flex items-center">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="bbl-prev-button"
              className="w-10 h-10 flex items-center justify-center rounded-s-md border-(--border) bg-(--secondary-bg) text-(--text-color-emphasis) shadow-custom hover:bg-(--main) hover:text-(--main-subtle) transition-all duration-300"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="bbl-next-button"
              className="w-10 h-10 flex items-center justify-center rounded-e-md border-l border-(--border) bg-(--secondary-bg) text-(--text-color-emphasis) shadow-custom hover:bg-(--main) hover:text-(--main-subtle) transition-all duration-300"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          spaceBetween={24}
          loop={true}
          breakpoints={{
            0: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1280: { slidesPerView: 6 },
          }}
          className="pb-12"
        >
          {locations.map((location, index) => {
            return (
              <SwiperSlide key={index}>
                <Link
                  href={`/colleges?state=${generateSlug(location.state)}&city=${generateSlug(location.city)}`}
                >
                  <div className="group relative rounded-custom overflow-hidden cursor-pointer">
                    <div className="relative aspect-3/4 sm:aspect-4/5 overflow-hidden">
                      <Image
                        src={locationsImages[index] || locationsImages[0]}
                        alt={location.city}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 16vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        quality={65}
                        priority={true}
                        fetchPriority={"high"}
                        loading={"eager"}
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-(--main) via-black/90 to-transparent opacity-60 group-hover:opacity-80 transition" />
                      <div className="absolute top-4 right-4 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition backdrop-blur-md p-2 rounded-full text-(--main-subtle)">
                        <ArrowUpRight size={20} />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-5 text-(--white)">
                        <h3 className="font-bold text-lg truncate">
                          {location.city}
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          {location.state}
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{location.count} Institutes</span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 z-20 bg-linear-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1500 ease-in-out" />
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
