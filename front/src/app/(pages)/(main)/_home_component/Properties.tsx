"use client";
import React, { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/autoplay";

import { HeadingProps } from "@/ui/headings/MainHeading";
import { PropertyProps } from "@/types/PropertyTypes";
import Link from "next/link";
import { generateSlug } from "@/context/Callbacks";
import Image from "next/image";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "@tanstack/react-query";
import API from "@/context/API";
import { useGetAssets } from "@/context/providers/AssetsProviders";
import InstitutesSkeleton from "@/ui/loader/page/landing/_components/InstitutesSkeleton";
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL;

const PropertyCarousel = () => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const { data, isLoading } = useQuery({
    queryKey: ["partner-logos"],
    queryFn: async () => {
      const [collgesRes, schoolRes] = await Promise.all([
        API.get(
          `/filter-by-category/property?names=College,University&&limit=20`,
        ),
        API.get(`/filter-by-category/property?names=School&limit=20`),
      ]);
      return {
        collegeData: collgesRes.data || [],
        schoolData: schoolRes.data || [],
      };
    },
    staleTime: 1000 * 60 * 5,
  });
  const processList = (list: PropertyProps[]) => {
    const valid = list.filter(
      (p) => p?.property_logo?.[0] && p.property_logo[0].trim() !== "",
    );
    if (valid.length > 0 && valid.length < 10) return [...valid, ...valid];
    return valid;
  };

  const firstList = useMemo(() => processList(data?.collegeData || []), [data]);
  const randomList = useMemo(() => processList(data?.schoolData || []), [data]);

  const swiperOptions = {
    modules: [Autoplay],
    loop: true,
    speed: 5000,
    spaceBetween: 12,
    slidesPerView: 3,
    allowTouchMove: true,
    grabCursor: true,
    observer: true,
    observeParents: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    watchSlidesProgress: true,
    breakpoints: {
      480: { slidesPerView: 4, spaceBetween: 14 },
      640: { slidesPerView: 5, spaceBetween: 16 },
      768: { slidesPerView: 6, spaceBetween: 18 },
      1024: { slidesPerView: 8, spaceBetween: 20 },
    },
  };

  if (isLoading || (!firstList.length && !randomList.length)) {
    return <InstitutesSkeleton />;
  }
  return (
    <section className="bg-(--primary-bg) py-10 px-4 sm:px-8 text-(--text-color) overflow-hidden">
      <div className="mb-10">
        <HeadingProps
          tag={`${firstList.length + randomList.length}+ Partnered for Excellence`}
          title="Our "
          activetitle="Institutes"
          subtitle="We collaborate only with India's leading, certified yoga institutions."
        />
      </div>

      <div className="linear-swiper-wrapper">
        {firstList.length > 0 && (
          <div className="mb-6" dir="ltr">
            <Swiper {...swiperOptions} className="ease-linear!">
              {firstList.map((prop, index) => (
                <SwiperSlide key={index} className="transition-timing-linear!">
                  <LogoLink prop={prop} isLight={isLight} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
      {randomList.length > 0 && (
        <div dir="rtl">
          <Swiper {...swiperOptions} className="ease-linear!">
            {randomList.map((prop, index) => (
              <SwiperSlide
                key={index}
                dir="ltr"
                className="transition-timing-linear!"
              >
                <LogoLink prop={prop} isLight={isLight} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </section>
  );
};

const LogoLink = React.memo(
  ({ prop, isLight }: { prop: PropertyProps; isLight: boolean }) => {
    const { getCategoryById } = useGetAssets();
    return (
      <Link
        href={`/${generateSlug(getCategoryById(prop?.academic_type) || "")}/${generateSlug(prop?.property_slug)}/overview`}
        className="flex items-center relative justify-center w-16 h-16 md:w-20 md:h-20 cursor-pointer overflow-hidden transform-gpu hover:scale-105"
      >
        <Image
          src={`${MEDIA_URL}/${prop.property_logo[0]}`}
          alt={prop.property_name}
          fill
          sizes="80px"
          className={`object-contain rounded-custom transition-opacity duration-300 ${
            isLight
              ? "grayscale-0"
              : "grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
          }`}
          loading="lazy"
        />
      </Link>
    );
  },
);

LogoLink.displayName = "LogoLink";

export default PropertyCarousel;
